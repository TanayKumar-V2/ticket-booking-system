import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        role: "ADMIN" | "ORGANIZER" | "USER";
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
