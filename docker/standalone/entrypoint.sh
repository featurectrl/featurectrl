#!/bin/sh
set -e

case "$1" in
  start|"")
    exec node src/index.js
    ;;
  db:migrate)
    exec node_modules/.bin/drizzle-kit migrate --config drizzle.config.js
    ;;
  *)
    exec "$@"
    ;;
esac
