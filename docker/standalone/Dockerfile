# syntax=docker/dockerfile:1.7

# ---- Stage 1: install production deps with Bun ----
FROM oven/bun:1.3.10-alpine AS deps

WORKDIR /app

COPY build/package.json ./
RUN bun install --production --no-save

# ---- Stage 2: runtime on Node LTS ----
FROM node:24-alpine AS runtime

RUN apk add --no-cache tini

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY build ./
COPY drizzle.config.js ./
COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

ENV NODE_ENV=production STANDALONE=true BACKEND_PORT=3000
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["start"]
