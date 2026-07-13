import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    private readonly db;
    constructor(usersService: UsersService, jwtService: JwtService, db: NeonDatabase<typeof schema>);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    private generateTokens;
}
