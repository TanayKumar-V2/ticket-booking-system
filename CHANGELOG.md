# Changelog

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
