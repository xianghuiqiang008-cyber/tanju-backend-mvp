#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env.production ]]; then
  echo "缺少 .env.production，请先从 .env.production.example 复制并填写真实配置。" >&2
  exit 1
fi

: "${POSTGRES_PASSWORD:?请通过环境变量设置 POSTGRES_PASSWORD}"

echo "[1/3] 构建并启动服务"
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build

echo "[2/3] 执行数据库迁移"
docker compose --env-file .env.production -f docker-compose.production.yml exec app npx prisma migrate deploy

echo "[3/3] 检查健康状态"
curl --fail --silent --show-error "http://127.0.0.1:${PORT:-3000}/api/health" >/dev/null
echo "部署完成。"
