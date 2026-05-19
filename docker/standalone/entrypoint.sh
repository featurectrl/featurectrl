#!/bin/sh
set -e

case "$1" in
  start|"")
    exec node /app/index.js
    ;;
  db:migrate)
    exec node /app/migrate.js
    ;;
  *)
    exec "$@"
    ;;
esac
