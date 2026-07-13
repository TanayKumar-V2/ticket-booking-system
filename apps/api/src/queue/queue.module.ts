import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SeatHoldProcessor } from './seat-hold.processor';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'seat-holds',
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [SeatHoldProcessor],
  exports: [BullModule],
})
export class QueueModule {}
