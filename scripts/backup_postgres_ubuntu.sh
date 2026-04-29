#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-/srv/fuchuang}"
ENV_FILE="${2:-.env.production}"
BACKUP_DIR="${3:-/srv/fuchuang/backups}"

cd "$PROJECT_DIR"
mkdir -p "$BACKUP_DIR"

set -a
source "$ENV_FILE"
set +a

STAMP="$(date +%Y%m%d_%H%M%S)"
TARGET_FILE="${BACKUP_DIR}/student_behavior_${STAMP}.sql.gz"

docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" exec -T postgres \
  pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "$TARGET_FILE"

echo "backup saved to: $TARGET_FILE"

