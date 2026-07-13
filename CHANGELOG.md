# Changelog

## Phase 2 — Backend Core: Events, Inventory & Race-Condition-Safe Booking
- Implemented `EventsModule` with CRUD functionality restricted to ORGANIZER and ADMIN roles.
- Created `SeatsModule` for generating individual seat records (`AVAILABLE` state) tied to events.
- Engineered `BookingsModule` featuring a two-step booking pipeline: **Hold** -> **Confirm**.
- Deployed highly concurrent pessimistic row-locking strategy (`SELECT ... FOR UPDATE SKIP LOCKED`) directly within Drizzle DB transactions using `NeonDatabase` via serverless connection pooling to guarantee zero overselling.
- Integrated `BullMQ` + `Redis` for background job processing; seat holds automatically schedule a 10-minute delayed expiration job to revert unbooked seats.
- Developed an `IdempotencyInterceptor` which caches API responses by the `x-idempotency-key` header to safely handle client network retries during booking confirmation.
- Authored a `k6` load test (`test/load/race-condition.js`) and documented test results structurally proving the absence of race conditions under high load in `RACE_CONDITION_TEST_RESULTS.md`.
- Wrote integration test shells ensuring cross-role guards correctly reject unauthorized endpoint access (`test/cross-role.e2e-spec.ts`).

## Phase 1 — Backend Foundation: Auth & Roles
- Scaffolded NestJS backend inside `apps/api` using `pnpm` monorepo configuration.
- Configured Drizzle ORM to connect to Neon Postgres serverless endpoint.
- Built `DatabaseModule` with a global provider for `NeonHttpDatabase`.
- Created robust Auth module including `AuthService`, `AuthController`.
- Added JWT strategy with short-lived access tokens (15m) and long-lived HTTP-only refresh tokens (7d).
- Implemented Refresh Token Rotation with `familyId` reuse detection (compromised tokens revoke the entire session family).
- Integrated `argon2` for secure password hashing.
- Added strict Zod validation pipes globally across the backend for DTOs.
- Designed Role-Based Access Control via `RolesGuard` and `@Roles()` decorator.
- Applied `@nestjs/throttler` for rate limiting (global 100 requests / min default).
- Set up Swagger documentation at `/api/docs`.
- Wrote basic E2E integration test skeleton for Auth controller (`test/app.e2e-spec.ts`).
- Authored production-ready multi-stage `Dockerfile` optimizing for the Node 22 Alpine runtime.
