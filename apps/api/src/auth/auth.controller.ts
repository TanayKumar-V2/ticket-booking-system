import { Controller, Post, Body, Res, Req, UsePipes, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './dto/auth.dto';
import type { RegisterDto, LoginDto } from './dto/auth.dto';
import type { Response, Request } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(body);
    this.setCookies(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(body);
    this.setCookies(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setCookies(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  private setCookies(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
