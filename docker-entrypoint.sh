#!/bin/sh
set -e

echo "[entrypoint] Running prisma migrate deploy..."
bunx prisma migrate deploy

echo "[entrypoint] Starting: $*"
exec "$@"
