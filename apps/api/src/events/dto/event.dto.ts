import { z } from 'zod';
import { eventStatusEnum } from '../../db/schema';

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  eventDate: z.string().datetime(),
  status: z.enum(eventStatusEnum.enumValues).optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
