import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly db;
    constructor(db: NeonDatabase<typeof schema>);
    create(createUserDto: CreateUserDto): Promise<{
        role: "ADMIN" | "ORGANIZER" | "USER";
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        role: "ADMIN" | "ORGANIZER" | "USER";
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    findById(id: string): Promise<{
        role: "ADMIN" | "ORGANIZER" | "USER";
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
