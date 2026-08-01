#!/bin/sh
set -eu

MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"
MINIO_BUCKET="${MINIO_BUCKET:-tandt-travel}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://127.0.0.1:9000}"

export MINIO_ROOT_USER="$MINIO_ACCESS_KEY"
export MINIO_ROOT_PASSWORD="$MINIO_SECRET_KEY"
export MINIO_ENDPOINT
export MINIO_BUCKET
export MINIO_ACCESS_KEY
export MINIO_SECRET_KEY

mkdir -p /data
chown -R nextjs:nodejs /data

# MinIO API stays on localhost only; console UI listens on :9001
su-exec nextjs minio server /data \
  --address "127.0.0.1:9000" \
  --console-address ":9001" &

echo "Waiting for embedded MinIO..."
i=0
until mc alias set local http://127.0.0.1:9000 "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" >/dev/null 2>&1; do
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
