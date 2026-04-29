#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-/srv/fuchuang}"
ENV_FILE="${2:-.env.production}"
BACKUP_FILE="${3:-}"

if [[ -z "$BACKUP_FILE" ]]; then
  echo "usage: restore_postgres_ubuntu.sh <project_dir> <env_file> <backup.sql.gz>"
  exit 1
fi

cd "$PROJECT_DIR"

set -a
source "$ENV_FILE"
set +a

gunzip -c "$BACKUP_FILE" | docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" exec -T postgres \
  psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"

echo "restore completed"

