import { CallHandler, ExecutionContext, Injectable, NestInterceptor, ConflictException, Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DATABASE_CONNECTION } from '../../db/database.module';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['x-idempotency-key'];

    if (!idempotencyKey) {
      return next.handle();
    }

    const userId = request.user?.id;
    if (!userId) {
      return next.handle();
    }

    // Use a transaction or simpler optimistic insert approach
    // We try to insert the key first. If it fails due to unique constraint, we fetch it.
    let keyRecord = await this.db.query.idempotencyKeys.findFirst({
      where: eq(schema.idempotencyKeys.key, idempotencyKey),
    });

    if (keyRecord) {
      if (keyRecord.responseStatus !== null) {
        // Return cached response
        const response = context.switchToHttp().getResponse();
        response.status(keyRecord.responseStatus);
        return of(keyRecord.responseBody ? JSON.parse(keyRecord.responseBody) : '');
      } else {
        // Still processing
        throw new ConflictException('A request with this idempotency key is already processing');
      }
    }

    try {
      const [inserted] = await this.db.insert(schema.idempotencyKeys).values({
        key: idempotencyKey,
        userId: userId,
        requestPath: request.url,
      }).returning();
      keyRecord = inserted;
    } catch (e: any) {
      if (e.code === '23505') { // unique violation
        throw new ConflictException('A request with this idempotency key is already processing');
      }
      throw e;
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        const response = context.switchToHttp().getResponse();
        await this.db.update(schema.idempotencyKeys)
          .set({
            responseBody: JSON.stringify(responseBody || null),
            responseStatus: response.statusCode,
          })
          .where(eq(schema.idempotencyKeys.key, idempotencyKey));
      }),
    );
  }
}
