#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ssh hetzner 'docker compose -f /root/ftmk-beer-bot/docker-compose.yml exec -T postgres pg_dump -U postgres -d ftmk_beer --clean --if-exists' > ftmk_beer_dump.sql

docker compose exec -T postgres psql -U postgres -d ftmk_beer < ftmk_beer_dump.sql
