import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        ORGANIZER: "ORGANIZER";
        USER: "USER";
    }>>>;
}, z.core.$strip>;
export type RegisterDto = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginDto = z.infer<typeof loginSchema>;
