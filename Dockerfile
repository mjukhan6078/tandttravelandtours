# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ARG TARGETARCH
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV MINIO_ENDPOINT=http://127.0.0.1:9000
ENV MINIO_ACCESS_KEY=minioadmin
ENV MINIO_SECRET_KEY=minioadmin
ENV MINIO_BUCKET=tandt-travel
ENV MINIO_REGION=us-east-1

RUN apk add --no-cache curl ca-certificates su-exec \
  && ARCH="${TARGETARCH:-amd64}" \
  && curl -fsSL "https://dl.min.io/server/minio/release/linux-${ARCH}/minio" -o /usr/local/bin/minio \
  && curl -fsSL "https://dl.min.io/client/mc/release/linux-${ARCH}/mc" -o /usr/local/bin/mc \
  && chmod +x /usr/local/bin/minio /usr/local/bin/mc \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /data \
  && chown -R nextjs:nodejs /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Root starts MinIO + app; processes drop to nextjs via su-exec
USER root
EXPOSE 3000 9001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
