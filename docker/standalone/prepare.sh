#!/bin/sh

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$DIR/../.." && pwd)"

BACKEND_APP_DIR="$REPO_ROOT/apps/backend"
WEB_APP_DIR="$REPO_ROOT/apps/web"
BUILD_DIR="$DIR/build"

rm -rf "$BUILD_DIR"

mkdir -p "$BUILD_DIR/dist"

cp "$BACKEND_APP_DIR/package.json" "$BUILD_DIR/package.json"
cp "$BACKEND_APP_DIR/bun.lock" "$BUILD_DIR/bun.lock"
cp -R "$BACKEND_APP_DIR/dist/." "$BUILD_DIR/dist/"
rm -rf "$BUILD_DIR/dist/types"

mkdir "$BUILD_DIR/dist/public"
cp -R "$WEB_APP_DIR/dist/." "$BUILD_DIR/dist/public/"
