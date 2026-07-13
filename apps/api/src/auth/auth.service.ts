import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { DATABASE_CONNECTION } from '../db/database.module';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
    });
    return this.generateTokens(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.role);
  }

  async refreshTokens(refreshToken: string) {
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenRecord = await this.db.query.refreshTokens.findFirst({
      where: eq(schema.refreshTokens.tokenHash, refreshToken),
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (tokenRecord.isRevoked) {
      // Token reuse detected - revoke entire family
      await this.db.update(schema.refreshTokens)
        .set({ isRevoked: true })
        .where(eq(schema.refreshTokens.familyId, tokenRecord.familyId));
      throw new UnauthorizedException('Token reuse detected. Session revoked.');
    }

    // Revoke the used token
    await this.db.update(schema.refreshTokens)
      .set({ isRevoked: true })
      .where(eq(schema.refreshTokens.id, tokenRecord.id));

    const user = await this.usersService.findById(payload.sub);
    return this.generateTokens(user.id, user.role, tokenRecord.familyId);
  }

  async logout(refreshToken: string) {
    await this.db.update(schema.refreshTokens)
      .set({ isRevoked: true })
      .where(eq(schema.refreshTokens.tokenHash, refreshToken));
  }

  private async generateTokens(userId: string, role: string, familyId?: string) {
    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });

    const finalFamilyId = familyId || randomUUID();

    await this.db.insert(schema.refreshTokens).values({
      userId,
      tokenHash: refreshToken,
      familyId: finalFamilyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // simplistic expiry
    });

    return { accessToken, refreshToken };
  }
}
