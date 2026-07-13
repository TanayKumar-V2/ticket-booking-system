import { z } from 'zod';

export const createSeatsSchema = z.object({
  eventId: z.string().uuid(),
  count: z.number().min(1).max(1000),
  price: z.number().min(0), // in cents
  prefix: z.string().default('GA-'),
});

export type CreateSeatsDto = z.infer<typeof createSeatsSchema>;
