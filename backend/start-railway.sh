#!/bin/bash
set -e

echo "========================================="
echo "Starting Nakama Server on Railway"
echo "========================================="

# Use Railway's internal DNS hostname for Postgres if POSTGRES_HOST is not set.
# The hostname follows the pattern <ServiceName>.railway.internal — ensure the
# Postgres service in your Railway project is named "Postgres" (capital P).
POSTGRES_HOST="${POSTGRES_HOST:-Postgres.railway.internal}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-nakama}"

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "ERROR: POSTGRES_PASSWORD environment variable is not set!"
    echo "Please add POSTGRES_PASSWORD to the Nakama service variables in Railway."
    exit 1
fi

echo "Database Host:  $POSTGRES_HOST"
echo "Database Name:  $POSTGRES_DB"
echo "Database User:  $POSTGRES_USER"

# Construct database URL (password intentionally omitted from log output)
DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_DB?sslmode=prefer"
echo "Database URL:   postgres://$POSTGRES_USER:***@$POSTGRES_HOST:5432/$POSTGRES_DB?sslmode=prefer"

# Wait for Postgres to be reachable before starting Nakama.
# Railway services may take a few seconds to become available after boot.
echo "Waiting for Postgres to be ready..."
MAX_RETRIES=30
RETRY_INTERVAL=2
attempt=1
until pg_isready -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; do
    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: Postgres at $POSTGRES_HOST:5432 did not become ready after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
        echo "Check that the Postgres service is running and that POSTGRES_HOST is correct."
        exit 1
    fi
    echo "  Attempt $attempt/$MAX_RETRIES — Postgres not ready yet, retrying in ${RETRY_INTERVAL}s..."
    sleep "$RETRY_INTERVAL"
    attempt=$((attempt + 1))
done
echo "Postgres is ready."

echo "Starting Nakama with configuration..."

# Start Nakama with all necessary parameters
exec nakama \
    --config /nakama/data/nakama-config.yml \
    --name nakama1 \
    --database.address "$DATABASE_URL" \
    --logger.level INFO \
    --session.token_expiry_sec 7200 \
    --runtime.path /nakama/build