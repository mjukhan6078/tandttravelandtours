#!/bin/sh
set -eu

MINIO_BUCKET="${MINIO_BUCKET:-tandt-travel}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://127.0.0.1:9000}"

# Prefer modern MinIO root credentials; fall back to access/secret for compatibility
ROOT_USER="${MINIO_ROOT_USER:-${MINIO_ACCESS_KEY:-minioadmin}}"
ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-${MINIO_SECRET_KEY:-minioadmin}}"

# App S3 client still uses these names
export MINIO_ENDPOINT
export MINIO_BUCKET
export MINIO_ACCESS_KEY="$ROOT_USER"
export MINIO_SECRET_KEY="$ROOT_PASSWORD"
export MINIO_ROOT_USER="$ROOT_USER"
export MINIO_ROOT_PASSWORD="$ROOT_PASSWORD"

mkdir -p /data
chown -R nextjs:nodejs /data

# Start MinIO without deprecated MINIO_ACCESS_KEY / MINIO_SECRET_KEY
# API on localhost only; console UI on :9001
(
  unset MINIO_ACCESS_KEY MINIO_SECRET_KEY
  export MINIO_ROOT_USER="$ROOT_USER"
  export MINIO_ROOT_PASSWORD="$ROOT_PASSWORD"
  exec su-exec nextjs minio server /data \
    --address "127.0.0.1:9000" \
    --console-address ":9001"
) &

echo "Waiting for embedded MinIO..."
i=0
until mc alias set local http://127.0.0.1:9000 "$ROOT_USER" "$ROOT_PASSWORD" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 40 ]; then
    echo "MinIO failed to become ready"
    exit 1
  fi
  sleep 0.5
done

mc mb -p "local/${MINIO_BUCKET}" >/dev/null 2>&1 || true
mc anonymous set none "local/${MINIO_BUCKET}" >/dev/null 2>&1 || true
echo "MinIO ready (bucket: ${MINIO_BUCKET})"

cd /app
exec su-exec nextjs node server.js
