import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { HoldSeatsDto, ConfirmBookingDto } from './dto/booking.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabase<typeof schema>,
    @InjectQueue('seat-holds') private seatHoldQueue: Queue,
  ) {}

  async holdSeats(userId: string, dto: HoldSeatsDto) {
    // We use a transaction to lock rows
    return await this.db.transaction(async (tx) => {
      // Find available seats for this event with lock
      const availableSeats = await tx
        .select()
        .from(schema.seats)
        .where(
          and(
            eq(schema.seats.eventId, dto.eventId),
            eq(schema.seats.status, 'AVAILABLE'),
          ),
        )
        .limit(dto.quantity)
        .for('update', { skipLocked: true });

      if (availableSeats.length < dto.quantity) {
        throw new BadRequestException('Not enough seats available at this moment');
      }

      const seatIds = availableSeats.map(s => s.id);
      const heldUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await tx.update(schema.seats)
        .set({
          status: 'HELD',
          heldByUserId: userId,
          heldUntil,
        })
        .where(inArray(schema.seats.id, seatIds));

      // Schedule delayed job to release holds if not booked
      await this.seatHoldQueue.add(
        'expire-hold',
        { seatIds, userId },
        { delay: 10 * 60 * 1000 },
      );

      return {
        success: true,
        heldSeats: availableSeats,
        heldUntil,
      };
    });
  }

  async confirmBooking(userId: string, dto: ConfirmBookingDto, idempotencyKey?: string) {
    return await this.db.transaction(async (tx) => {
      // Find held seats by this user for the event
      const heldSeats = await tx.select().from(schema.seats)
        .where(
          and(
            eq(schema.seats.eventId, dto.eventId),
            eq(schema.seats.heldByUserId, userId),
            eq(schema.seats.status, 'HELD')
          )
        )
        .for('update');

      if (heldSeats.length === 0) {
        throw new BadRequestException('No held seats found or hold expired');
      }

      const seatIds = heldSeats.map(s => s.id);
      const totalAmount = heldSeats.reduce((acc, seat) => acc + seat.price, 0);

      // Create Booking
      const [booking] = await tx.insert(schema.bookings).values({
        userId,
        eventId: dto.eventId,
        totalAmount,
        status: 'CONFIRMED',
        idempotencyKey,
      }).returning();

      // Create booking seats mapping
      const bookingSeatsData = seatIds.map(seatId => ({
        bookingId: booking.id,
        seatId,
      }));

      await tx.insert(schema.bookingSeats).values(bookingSeatsData);

      // Mark seats as BOOKED
      await tx.update(schema.seats)
        .set({
          status: 'BOOKED',
        })
        .where(inArray(schema.seats.id, seatIds));

      return { booking, seats: heldSeats };
    });
  }

  async getMyBookings(userId: string) {
    return this.db.query.bookings.findMany({
      where: eq(schema.bookings.userId, userId),
      with: {
        event: true,
        bookingSeats: {
          with: { seat: true }
        }
      }
    });
  }
}
