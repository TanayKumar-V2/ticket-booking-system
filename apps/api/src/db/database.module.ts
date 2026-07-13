import { Global, Module } from '@nestjs/common';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        const sql = neon(process.env.DATABASE_URL!);
        return drizzle(sql, { schema });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
