#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-/srv/fuchuang}"
ENV_FILE="${2:-.env.production}"

echo "[1/6] enter project directory"
cd "$PROJECT_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "missing env file: $ENV_FILE"
  echo "copy .env.production.example first:"
  echo "cp .env.production.example $ENV_FILE"
  exit 1
fi

echo "[2/6] pull latest images/build context"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" pull || true

echo "[3/6] build and start stack"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d --build

echo "[4/6] show service status"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" ps

echo "[5/6] wait for backend health"
for i in {1..20}; do
  if curl -fsS http://127.0.0.1/healthz >/dev/null 2>&1; then
    echo "backend is healthy"
    break
  fi
  sleep 3
done

echo "[6/6] health response"
curl -fsS http://127.0.0.1/healthz || true

