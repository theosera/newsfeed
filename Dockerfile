# syntax=docker/dockerfile:1

# Base image — Node 22 to match local development.
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- Install dependencies (linux binaries fetched here, not the host's) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Build the app ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client generation does not connect to a database; the dummy URL only
# satisfies prisma.config.ts loading env("DATABASE_URL") at build time.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npx prisma generate
RUN npm run build

# --- Runtime ---
# Full dependencies are kept so the entrypoint can run `prisma db push` and the
# tsx seed at startup, then serve with `next start`.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
