import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { inArray, and, eq } from 'drizzle-orm';

@Processor('seat-holds')
@Injectable()
export class SeatHoldProcessor extends WorkerHost {
  private readonly logger = new Logger(SeatHoldProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabase<typeof schema>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { seatIds, userId } = job.data;
    
    this.logger.log(`Processing hold expiry for seats ${seatIds.join(', ')} (User: ${userId})`);

    // Release seats only if they are still HELD by this user.
    // If they were confirmed, their status is BOOKED, so this update won't affect them.
    await this.db.update(schema.seats)
      .set({
        status: 'AVAILABLE',
        heldByUserId: null,
        heldUntil: null,
      })
      .where(
        and(
          inArray(schema.seats.id, seatIds),
          eq(schema.seats.status, 'HELD'),
          eq(schema.seats.heldByUserId, userId)
        )
      );
      
    this.logger.log(`Completed expiry check for seats ${seatIds.join(', ')}`);
  }
}
