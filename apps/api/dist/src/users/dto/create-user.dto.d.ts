import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    passwordHash: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        ORGANIZER: "ORGANIZER";
        USER: "USER";
    }>>;
}, z.core.$strip>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
