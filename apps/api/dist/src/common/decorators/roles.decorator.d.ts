import { roleEnum } from '../../db/schema';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: (typeof roleEnum.enumValues)[number][]) => import("@nestjs/common").CustomDecorator<string>;
