#!/bin/bash
set -e

echo "========================================="
echo "Starting Nakama Server on Railway"
echo "========================================="

# Check if required environment variables are set
if [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo "ERROR: Missing required database environment variables!"
    echo "Please set: POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB"
    exit 1
fi

echo "Database Host: $POSTGRES_HOST"
echo "Database Name: $POSTGRES_DB"
echo "Database User: $POSTGRES_USER"

# Construct database URL
DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_DB?sslmode=prefer"

echo "Starting Nakama with configuration..."

# Start Nakama with all necessary parameters
exec nakama \
    --config /nakama/data/nakama-config.yml \
    --name nakama1 \
    --database.address "$DATABASE_URL" \
    --logger.level INFO \
    --session.token_expiry_sec 7200 \
    --runtime.path ./build