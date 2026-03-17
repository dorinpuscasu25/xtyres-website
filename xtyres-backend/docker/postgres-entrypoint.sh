#!/bin/sh
set -eu

export POSTGRES_DB="${POSTGRES_DB:-${DB_DATABASE:-xtyres}}"
export POSTGRES_USER="${POSTGRES_USER:-${DB_USERNAME:-postgres}}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-${DB_PASSWORD:-postgres}}"

exec docker-entrypoint.sh postgres
