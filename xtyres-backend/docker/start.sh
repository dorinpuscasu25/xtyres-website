#!/bin/sh
set -eu

cd /var/www/html

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

php artisan optimize:clear

until php artisan migrate --force --no-interaction; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force --no-interaction

exec npx concurrently \
  -k \
  -n app,vite \
  -c "#93c5fd,#fb7185" \
  "php artisan serve --host=0.0.0.0 --port=${APP_PORT:-8000}" \
  "npm run dev -- --host 0.0.0.0 --port ${VITE_PORT:-5173} --strictPort"
