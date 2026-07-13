import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [SeatsService],
  controllers: [SeatsController],
  exports: [SeatsService],
})
export class SeatsModule {}
