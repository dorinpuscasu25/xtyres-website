#!/bin/sh
set -eu

cd /app

export VITE_HOST="${VITE_HOST:-0.0.0.0}"
export VITE_PORT="${VITE_PORT:-5174}"
export VITE_HMR_HOST="${VITE_HMR_HOST:-localhost}"
export VITE_USE_POLLING="${VITE_USE_POLLING:-true}"
export VITE_USE_DEV_SERVER="${VITE_USE_DEV_SERVER:-true}"

if [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  npm install
fi

if [ "${VITE_USE_DEV_SERVER}" = "true" ]; then
  exec npm run dev -- --host "${VITE_HOST}" --port "${VITE_PORT}" --strictPort
fi

npm run build

exec npm run preview -- --host "${VITE_HOST}" --port "${VITE_PORT}" --strictPort
