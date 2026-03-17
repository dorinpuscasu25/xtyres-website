#!/bin/sh
set -eu

cd /app

if [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  npm install
fi

exec npm run dev -- --host 0.0.0.0 --port "${VITE_PORT:-5174}" --strictPort
