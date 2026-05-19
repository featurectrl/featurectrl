# syntax=docker/dockerfile:1.7

# ---- Stage 1: install production deps with Bun ----
FROM oven/bun:1.3.10-alpine AS deps

WORKDIR /app

COPY build/package.json build/bun.lock ./
RUN bun install --production

# ---- Stage 2: runtime on Node LTS ----
FROM node:24-alpine AS runtime

RUN apk add --no-cache tini

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY ./build/dist ./
COPY --chmod=755 entrypoint.sh /app/entrypoint.sh

ENV NODE_ENV=production STANDALONE=true BACKEND_PORT=3000
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--", "/app/entrypoint.sh"]
CMD ["start"]
