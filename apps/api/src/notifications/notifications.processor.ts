import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor() {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job: ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case 'send-ticket-email':
        await this.handleSendTicketEmail(job.data);
        break;
      case 'send-event-reminder':
        await this.handleSendEventReminder(job.data);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleSendTicketEmail(data: any) {
    const { email, bookingId, eventTitle, seats } = data;
    this.logger.log(`[Email Service Mock] Sending tickets to ${email} for Booking ${bookingId}`);
    
    // Simulate network delay for sending email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    this.logger.log(`[Email Service Mock] 📧 Ticket email successfully sent to ${email} for event "${eventTitle}". Seats: ${seats.join(', ')}`);
  }

  private async handleSendEventReminder(data: any) {
    const { email, eventTitle, timeRemaining } = data;
    this.logger.log(`[Email Service Mock] Sending reminder to ${email} for Event ${eventTitle}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.logger.log(`[Email Service Mock] ⏰ Reminder sent! Event "${eventTitle}" starts in ${timeRemaining}.`);
  }
}
