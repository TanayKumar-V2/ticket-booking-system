import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    private readonly db;
    constructor(usersService: UsersService, jwtService: JwtService, db: NeonHttpDatabase<typeof schema>);
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
