import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async queueTicketEmail(email: string, bookingId: string, eventTitle: string, seats: string[]) {
    await this.notificationsQueue.add('send-ticket-email', {
      email,
      bookingId,
      eventTitle,
      seats,
    });
    this.logger.log(`Queued ticket email for booking ${bookingId}`);
  }
}
