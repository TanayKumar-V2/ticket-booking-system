import { z } from 'zod';

export const holdSeatsSchema = z.object({
  eventId: z.string().uuid(),
  quantity: z.number().min(1).max(10), // hold up to 10 seats
});

export type HoldSeatsDto = z.infer<typeof holdSeatsSchema>;

export const confirmBookingSchema = z.object({
  eventId: z.string().uuid(), // Confirm the hold for this event
});

export type ConfirmBookingDto = z.infer<typeof confirmBookingSchema>;
