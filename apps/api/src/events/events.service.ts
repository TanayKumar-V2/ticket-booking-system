import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  async create(organizerId: string, dto: CreateEventDto) {
    const [event] = await this.db.insert(schema.events).values({
      title: dto.title,
      description: dto.description,
      eventDate: new Date(dto.eventDate),
      organizerId,
      status: dto.status || 'DRAFT',
    }).returning();
    return event;
  }

  async findAll(userRole?: string) {
    if (userRole === 'ADMIN') {
      return this.db.query.events.findMany();
    }
    // Users and unauthorized see only published
    return this.db.query.events.findMany({
      where: eq(schema.events.status, 'PUBLISHED'),
    });
  }

  async findOrganizerEvents(organizerId: string) {
    return this.db.query.events.findMany({
      where: eq(schema.events.organizerId, organizerId),
    });
  }

  async findOne(id: string) {
    const event = await this.db.query.events.findFirst({
      where: eq(schema.events.id, id),
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, userId: string, role: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    if (role !== 'ADMIN' && event.organizerId !== userId) {
      throw new ForbiddenException('You do not own this event');
    }

    const [updated] = await this.db.update(schema.events)
      .set({
        title: dto.title,
        description: dto.description,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        status: dto.status,
        updatedAt: new Date(),
      })
      .where(eq(schema.events.id, id))
      .returning();
    return updated;
  }

  async delete(id: string, userId: string, role: string) {
    const event = await this.findOne(id);
    if (role !== 'ADMIN' && event.organizerId !== userId) {
      throw new ForbiddenException('You do not own this event');
    }

    await this.db.delete(schema.events).where(eq(schema.events.id, id));
    return { success: true };
  }
}
