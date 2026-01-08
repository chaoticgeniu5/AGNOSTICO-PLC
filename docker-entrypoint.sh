#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/packages/backend
npx prisma migrate deploy || npx prisma db push

echo "Seeding database..."
node -r tsx/register src/database/seed.ts || true

echo "Starting application..."
exec "$@"
