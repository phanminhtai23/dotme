#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_DIR="${DOTME_DIR:-/home/opc/projects/dotme}"

cd "$DEPLOY_DIR"
test -f .env || { echo "Missing $DEPLOY_DIR/.env" >&2; exit 1; }
command -v pm2 >/dev/null || { echo "PM2 is required on the server" >&2; exit 1; }

git fetch origin main
git checkout main
git pull --ff-only origin main

npm ci --include=dev
npm run build
node --env-file=.env server/migrate-supabase.js

pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

for attempt in $(seq 1 30); do
    if curl --fail --silent http://127.0.0.1:3002/api/health >/dev/null; then
        echo "dotme deployment is healthy"
        exit 0
    fi
    sleep 2
done

pm2 status
echo "dotme API health check timed out" >&2
exit 1
