#!/bin/sh
set -e

echo "[entrypoint] Applying database schema (prisma db push)..."
npx prisma db push

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] Seeding database (idempotent upserts)..."
  npm run prisma:seed
fi

echo "[entrypoint] Starting application: $*"
exec "$@"
