FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
RUN cd apps/api && pnpm run build

FROM node:22-alpine AS runner

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
