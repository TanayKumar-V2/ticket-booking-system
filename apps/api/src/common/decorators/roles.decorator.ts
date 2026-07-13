import { SetMetadata } from '@nestjs/common';
import { roleEnum } from '../../db/schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (typeof roleEnum.enumValues)[number][]) => SetMetadata(ROLES_KEY, roles);
