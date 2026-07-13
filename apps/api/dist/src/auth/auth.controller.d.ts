import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto } from './dto/auth.dto';
import type { Response, Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto, res: Response): Promise<{
        accessToken: string;
    }>;
    login(body: LoginDto, res: Response): Promise<{
        accessToken: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
    private setCookies;
}
