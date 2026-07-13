import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly db;
    constructor(db: NeonHttpDatabase<typeof schema>);
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
