import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const [user] = await this.db.insert(schema.users).values({
      email: createUserDto.email,
      passwordHash: createUserDto.passwordHash,
      role: createUserDto.role || 'USER',
    }).returning();
    return user;
  }

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  async findById(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
