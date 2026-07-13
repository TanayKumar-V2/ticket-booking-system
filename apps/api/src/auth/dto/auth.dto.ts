import { z } from 'zod';
import { roleEnum } from '../../db/schema';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(roleEnum.enumValues).optional().default('USER'),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginDto = z.infer<typeof loginSchema>;
