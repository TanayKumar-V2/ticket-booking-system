import { z } from 'zod';
import { roleEnum } from '../../db/schema';

export const createUserSchema = z.object({
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(roleEnum.enumValues).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
