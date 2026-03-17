#!/bin/sh
set -eu

cd /var/www/html

export DB_CONNECTION="${DB_CONNECTION:-sqlite}"
export APP_PORT="${APP_PORT:-8000}"
export VITE_HOST="${VITE_HOST:-0.0.0.0}"
export VITE_PORT="${VITE_PORT:-5173}"
export VITE_USE_POLLING="${VITE_USE_POLLING:-true}"
export VITE_USE_DEV_SERVER="${VITE_USE_DEV_SERVER:-true}"

app_url="${APP_URL:-http://localhost:${APP_PORT}}"
app_host="$(printf '%s' "${app_url}" | sed -E 's#^[a-zA-Z]+://([^/:]+).*$#\1#')"

if [ -z "${VITE_HMR_HOST:-}" ]; then
  export VITE_HMR_HOST="${app_host:-localhost}"
else
  export VITE_HMR_HOST
fi

if [ -z "${VITE_DEV_SERVER_URL:-}" ]; then
  export VITE_DEV_SERVER_URL="http://${VITE_HMR_HOST}:${VITE_PORT}"
else
  export VITE_DEV_SERVER_URL
fi

if [ "${DB_CONNECTION}" = "sqlite" ]; then
  export DB_DATABASE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
  mkdir -p "$(dirname "${DB_DATABASE}")"
  touch "${DB_DATABASE}"
elif [ "${DB_CONNECTION}" = "pgsql" ]; then
  case "${DB_HOST:-}" in
    ""|"127.0.0.1"|"localhost")
      export DB_HOST=postgres
      ;;
  esac

  export DB_PORT="${DB_PORT:-5432}"
  export DB_DATABASE="${DB_DATABASE:-xtyres}"
  export DB_USERNAME="${DB_USERNAME:-postgres}"
  export DB_PASSWORD="${DB_PASSWORD:-postgres}"
fi

if [ ! -f vendor/autoload.php ] || [ composer.lock -nt vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

if [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  npm install
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/testing storage/framework/views storage/logs bootstrap/cache

if [ ! -L public/storage ] && [ ! -e public/storage ]; then
  php artisan storage:link
fi

if [ "${DB_CONNECTION}" = "pgsql" ]; then
  until php artisan migrate --force --no-interaction; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
  done
else
  php artisan migrate --force --no-interaction
fi

php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force --no-interaction

if [ "${VITE_USE_DEV_SERVER}" = "true" ]; then
  exec npx concurrently \
    -k \
    -n app,vite \
    -c "#93c5fd,#fb7185" \
    "php artisan serve --host=0.0.0.0 --port=${APP_PORT}" \
    "npm run dev -- --host ${VITE_HOST} --port ${VITE_PORT} --strictPort"
fi

rm -f public/hot
npm run build

exec php artisan serve --host=0.0.0.0 --port="${APP_PORT}"
