import { z } from 'zod';

export const holdSeatsSchema = z.object({
  eventId: z.string().uuid(),
  quantity: z.number().min(1).max(10), // hold up to 10 seats
});

export type HoldSeatsDto = z.infer<typeof holdSeatsSchema>;

export const createCheckoutSchema = z.object({
  eventId: z.string().uuid(),
});

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;

export const confirmBookingSchema = z.object({
  bookingId: z.string().uuid(),
  razorpayPaymentId: z.string(),
  razorpayOrderId: z.string(),
  razorpaySignature: z.string(),
});

export type ConfirmBookingDto = z.infer<typeof confirmBookingSchema>;
