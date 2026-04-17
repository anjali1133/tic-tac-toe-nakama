#!/bin/bash
set -e

echo "========================================="
echo "Starting Nakama Server on Railway"
echo "========================================="
echo "PORT (Railway public listener): ${PORT:-unset}"
if [ -n "${RAILWAY_ENVIRONMENT:-}" ] && [ -z "${PORT:-}" ]; then
    echo "ERROR: PORT is unset on Railway. Use an HTTP/Web service (Railway injects PORT) or set PORT manually."
    exit 1
fi

# --- Database URL (Railway) -------------------------------------------------
# Prefer DATABASE_PRIVATE_URL / DATABASE_URL from Railway when the Postgres
# plugin is linked (correct host, SSL, and credentials). The default host
# Postgres.railway.internal only works if your DB service is *named* Postgres;
# otherwise pg_isready never succeeds and nothing ever binds $PORT → endless
# "service unavailable" on /healthcheck.
NAKAMA_DB_URL=""
if [ -n "${DATABASE_PRIVATE_URL:-}" ]; then
    NAKAMA_DB_URL="$DATABASE_PRIVATE_URL"
    echo "Database:       using DATABASE_PRIVATE_URL (internal)"
elif [ -n "${DATABASE_URL:-}" ]; then
    NAKAMA_DB_URL="$DATABASE_URL"
    echo "Database:       using DATABASE_URL"
else
    POSTGRES_HOST="${POSTGRES_HOST:-${PGHOST:-Postgres.railway.internal}}"
    POSTGRES_PORT="${POSTGRES_PORT:-${PGPORT:-5432}}"
    POSTGRES_USER="${POSTGRES_USER:-${PGUSER:-postgres}}"
    POSTGRES_DB="${POSTGRES_DB:-${PGDATABASE:-railway}}"
    if [ -z "${POSTGRES_PASSWORD:-}" ]; then
        echo "ERROR: No DATABASE_URL / DATABASE_PRIVATE_URL and no POSTGRES_PASSWORD."
        echo "In Railway: link Postgres to this service, or set DATABASE_URL, or set POSTGRES_* variables."
        exit 1
    fi
    NAKAMA_DB_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=prefer"
    echo "Database host:  $POSTGRES_HOST:$POSTGRES_PORT"
    echo "Database name:  $POSTGRES_DB"
    echo "Database user:  $POSTGRES_USER"
    echo "Database URL:   postgres://${POSTGRES_USER}:***@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=prefer"
fi

# Wait for Postgres to be reachable before starting Nakama.
echo "Waiting for Postgres to be ready..."
MAX_RETRIES=45
RETRY_INTERVAL=2
attempt=1
until pg_isready -d "$NAKAMA_DB_URL" -t 2; do
    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: Postgres did not become ready after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
        echo "Fix: In Railway → Nakama service → Variables → add reference to Postgres DATABASE_URL"
        echo "     (or set DATABASE_PRIVATE_URL / correct POSTGRES_HOST for your DB service name)."
        exit 1
    fi
    echo "  Attempt $attempt/$MAX_RETRIES — Postgres not ready yet, retrying in ${RETRY_INTERVAL}s..."
    sleep "$RETRY_INTERVAL"
    attempt=$((attempt + 1))
done
echo "Postgres is ready."

# Image build already runs `npm run build`; skip at runtime so the process
# listens on $PORT sooner (Railway healthchecks target $PORT immediately).
if [ ! -f "/nakama/build/index.js" ]; then
    echo "Building TypeScript runtime (no prebuilt index.js in image)..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "ERROR: npm run build failed!"
        exit 1
    fi
    if [ ! -f "/nakama/build/index.js" ]; then
        echo "ERROR: TypeScript build failed - index.js not found!"
        ls -la /nakama/build/ || echo "Build directory does not exist"
        exit 1
    fi
    echo "TypeScript build completed successfully."
else
    echo "Using prebuilt runtime at /nakama/build/index.js"
fi

echo "Running database migration..."
/nakama/nakama migrate up --database.address "$NAKAMA_DB_URL"
if [ $? -ne 0 ]; then
    echo "ERROR: Database migration failed!"
    exit 1
fi
echo "Database migration completed successfully."

echo "Starting Nakama with configuration..."
echo "Nakama executable: $(which nakama || echo '/nakama/nakama')"
echo "Config file: /nakama/data/nakama-config.yml"

# Security keys — set these in Railway service variables.
# Defaults are provided only so the server starts; override them in production.
NAKAMA_SESSION_ENCRYPTION_KEY="${NAKAMA_SESSION_ENCRYPTION_KEY:-changeme-session-key}"
NAKAMA_SESSION_REFRESH_ENCRYPTION_KEY="${NAKAMA_SESSION_REFRESH_ENCRYPTION_KEY:-changeme-refresh-key}"
# Must match the game client (e.g. VITE_NAKAMA_SERVER_KEY on Vercel). Nakama's dev default is "defaultkey".
NAKAMA_SERVER_KEY="${NAKAMA_SERVER_KEY:-defaultkey}"
NAKAMA_RUNTIME_HTTP_KEY="${NAKAMA_RUNTIME_HTTP_KEY:-changeme-http-key}"
NAKAMA_CONSOLE_USERNAME="${NAKAMA_CONSOLE_USERNAME:-admin}"
NAKAMA_CONSOLE_PASSWORD="${NAKAMA_CONSOLE_PASSWORD:-changeme-console-password}"
NAKAMA_CONSOLE_SIGNING_KEY="${NAKAMA_CONSOLE_SIGNING_KEY:-defaultsigningkey}"

echo "Console username: $NAKAMA_CONSOLE_USERNAME"
echo "Security keys:    loaded from environment (values hidden)"

# Railway assigns PORT for the public listener. Nakama 3 HTTP + WS gateway uses socket.port;
# internal gRPC listens on socket.port - 1. Console must not collide with either or startup fails
# (Railway healthchecks then see "service unavailable" because nothing is listening on $PORT).
RAILWAY_PORT="${PORT:-7350}"
GRPC_INTERNAL_PORT=$((RAILWAY_PORT - 1))
CONSOLE_PORT="${NAKAMA_CONSOLE_PORT:-7351}"
while [ "$CONSOLE_PORT" -eq "$RAILWAY_PORT" ] || [ "$CONSOLE_PORT" -eq "$GRPC_INTERNAL_PORT" ]; do
    CONSOLE_PORT=$((CONSOLE_PORT + 1))
done
echo "Railway assigned port: $RAILWAY_PORT"
echo "Client API (HTTP + realtime) will listen on port: $RAILWAY_PORT"
echo "Console will listen on port: $CONSOLE_PORT (gRPC internal uses $GRPC_INTERNAL_PORT)"

# Start Nakama — security-sensitive values are passed as CLI flags so they are
# read from the Railway environment at runtime and never baked into the image.
echo "Exec: nakama (HTTP API :$RAILWAY_PORT, console :$CONSOLE_PORT)"
exec /nakama/nakama \
    --config /nakama/data/nakama-config.yml \
    --name nakama1 \
    --database.address "$NAKAMA_DB_URL" \
    --logger.level INFO \
    --session.encryption_key "$NAKAMA_SESSION_ENCRYPTION_KEY" \
    --session.refresh_encryption_key "$NAKAMA_SESSION_REFRESH_ENCRYPTION_KEY" \
    --session.token_expiry_sec 7200 \
    --socket.server_key "$NAKAMA_SERVER_KEY" \
    --runtime.http_key "$NAKAMA_RUNTIME_HTTP_KEY" \
    --runtime.path /nakama/build \
    --console.username "$NAKAMA_CONSOLE_USERNAME" \
    --console.password "$NAKAMA_CONSOLE_PASSWORD" \
    --console.signing_key "$NAKAMA_CONSOLE_SIGNING_KEY" \
    --console.port "$CONSOLE_PORT" \
    --socket.port "$RAILWAY_PORT"
