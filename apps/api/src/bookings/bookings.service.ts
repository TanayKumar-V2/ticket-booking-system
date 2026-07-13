import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { HoldSeatsDto, ConfirmBookingDto } from './dto/booking.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabase<typeof schema>,
    @InjectQueue('seat-holds') private seatHoldQueue: Queue,
    private readonly paymentsService: PaymentsService,
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

  async createCheckout(userId: string, eventId: string, idempotencyKey?: string) {
    return await this.db.transaction(async (tx) => {
      // Find held seats
      const heldSeats = await tx.select().from(schema.seats)
        .where(
          and(
            eq(schema.seats.eventId, eventId),
            eq(schema.seats.heldByUserId, userId),
            eq(schema.seats.status, 'HELD')
          )
        )
        .for('update');

      if (heldSeats.length === 0) {
        throw new BadRequestException('No held seats found or hold expired');
      }

      const totalAmount = heldSeats.reduce((acc, seat) => acc + seat.price, 0);

      // Create Booking row as PENDING
      const [booking] = await tx.insert(schema.bookings).values({
        userId,
        eventId,
        totalAmount,
        status: 'PENDING',
        idempotencyKey,
      }).returning();

      // Generate Razorpay Order
      const order = await this.paymentsService.createOrder(totalAmount, booking.id);

      // Update booking with Razorpay Order ID
      const [updatedBooking] = await tx.update(schema.bookings)
        .set({ razorpayOrderId: order.id })
        .where(eq(schema.bookings.id, booking.id))
        .returning();

      return {
        bookingId: updatedBooking.id,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    });
  }

  async confirmBooking(
    userId: string, 
    bookingId: string, 
    razorpayPaymentId: string, 
    razorpayOrderId: string, 
    razorpaySignature: string
  ) {
    // 1. Verify Signature
    const isValid = this.paymentsService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    return await this.db.transaction(async (tx) => {
      // 2. Find Pending Booking
      const [booking] = await tx.select().from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.id, bookingId),
            eq(schema.bookings.userId, userId),
            eq(schema.bookings.status, 'PENDING')
          )
        )
        .for('update');

      if (!booking) {
        throw new BadRequestException('Booking not found or already processed');
      }

      // 3. Find held seats
      const heldSeats = await tx.select().from(schema.seats)
        .where(
          and(
            eq(schema.seats.eventId, booking.eventId),
            eq(schema.seats.heldByUserId, userId),
            eq(schema.seats.status, 'HELD')
          )
        );

      if (heldSeats.length === 0) {
        throw new BadRequestException('Held seats expired before payment confirmation');
      }

      const seatIds = heldSeats.map(s => s.id);

      // 4. Create booking seats mapping
      const bookingSeatsData = seatIds.map(seatId => ({
        bookingId: booking.id,
        seatId,
      }));

      await tx.insert(schema.bookingSeats).values(bookingSeatsData);

      // 5. Mark seats as BOOKED
      await tx.update(schema.seats)
        .set({ status: 'BOOKED' })
        .where(inArray(schema.seats.id, seatIds));

      // 6. Mark booking as CONFIRMED
      const [confirmedBooking] = await tx.update(schema.bookings)
        .set({ 
          status: 'CONFIRMED',
          razorpayPaymentId,
        })
        .where(eq(schema.bookings.id, booking.id))
        .returning();

      return { booking: confirmedBooking, seats: heldSeats };
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
