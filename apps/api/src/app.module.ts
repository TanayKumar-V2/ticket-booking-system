import { Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // global rate limit
    }]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule {}
