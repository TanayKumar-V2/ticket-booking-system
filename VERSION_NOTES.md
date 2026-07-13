# Version Notes

This project uses the following pinned package versions to guarantee reproducibility and prevent breaking changes.

## Frontend (Next.js & React)
- `next`: 16.2.10
- `react`: 19.2.7
- `react-dom`: 19.2.7
- `tailwindcss`: 4.3.2

**Notes on Next.js 16 App Router:**
Next.js 16 continues the standard App Router paradigms. Data fetching defaults remain focused on standard `fetch` caching and async request APIs (like async `params` and `searchParams` in pages and layouts which were solidified in Next.js 15). We will adhere to these async component patterns.

## Backend (NestJS & DB)
- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`: 11.1.28
- `drizzle-orm`: 0.45.2
- `drizzle-kit`: 0.31.10
- `@neondatabase/serverless`: 1.1.0

**Notes on NestJS & Drizzle:**
For NestJS 11 + Drizzle 0.45+, the recommended approach remains creating a custom provider (or using a module like `@knaadh/nestjs-drizzle-neon` if highly maintained, but custom is often safer for strict TS control). We will create a `DatabaseModule` with a standard provider injecting the Neon serverless pool into Drizzle.

## Shared / Infrastructure
- `zod`: 4.4.3
- `bullmq`: 5.80.2
- `ioredis`: 5.11.1
- `jsonwebtoken`: 9.0.3
- `@nestjs/jwt`: 11.0.2
- `passport-jwt`: 4.0.1
- `@nestjs/throttler`: 6.5.0

## Runtime
- Node.js Target: `22-alpine` (Active LTS)
- Package Manager: `pnpm` (latest)

All implementations will strict-pin these dependencies in `package.json` across the monorepo workspace.
