#!/usr/bin/env sh

set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$HERE/.." && pwd)"

BACKEND_DIST="$REPO_ROOT/apps/backend/dist"
WEB_DIST="$REPO_ROOT/apps/web/dist"
BUILD_DIR="$REPO_ROOT/docker/standalone/build"

export STANDALONE=true

(cd "$REPO_ROOT/apps/backend" && bun run build)
(cd "$REPO_ROOT/apps/web" && bunx vite build)

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/src"

find "$BACKEND_DIST" -mindepth 1 -maxdepth 1 \
  ! -name types ! -name migrations ! -name package.json \
  -exec cp -R {} "$BUILD_DIR/src/" \;

cp "$BACKEND_DIST/package.json" "$BUILD_DIR/package.json"
cp -R "$BACKEND_DIST/migrations" "$BUILD_DIR/migrations"
cp -R "$WEB_DIST" "$BUILD_DIR/public"

docker buildx build -t featurectrl "$REPO_ROOT/docker/standalone"
