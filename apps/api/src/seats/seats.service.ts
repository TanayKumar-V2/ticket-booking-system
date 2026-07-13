import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateSeatsDto } from './dto/seat.dto';
import { EventsService } from '../events/events.service';

@Injectable()
export class SeatsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabase<typeof schema>,
    private eventsService: EventsService,
  ) {}

  async createBulk(userId: string, role: string, dto: CreateSeatsDto) {
    const event = await this.eventsService.findOne(dto.eventId);
    if (role !== 'ADMIN' && event.organizerId !== userId) {
      throw new ForbiddenException('You do not own this event');
    }

    const seatsToInsert = Array.from({ length: dto.count }).map((_, i) => ({
      eventId: dto.eventId,
      seatIdentifier: `${dto.prefix}${i + 1}-${Date.now().toString().slice(-4)}`,
      price: dto.price,
      status: 'AVAILABLE' as const,
    }));

    await this.db.insert(schema.seats).values(seatsToInsert);
    return { success: true, count: dto.count };
  }

  async getEventSeats(eventId: string) {
    return this.db.query.seats.findMany({
      where: eq(schema.seats.eventId, eventId),
      orderBy: (seats, { asc }) => [asc(seats.seatIdentifier)],
    });
  }
}
