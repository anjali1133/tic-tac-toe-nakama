FROM heroiclabs/nakama:3.21.1

# Install Node.js and npm for TypeScript compilation
USER root
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /nakama

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Copy Nakama configuration
COPY nakama-config.yml /nakama/data/

# Switch back to nakama user
USER nakama

# Expose the ports
EXPOSE 7349 7350 7351

# Start Nakama
CMD ["sh", "-c", "/nakama/nakama migrate up --database.address postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_DB?sslmode=prefer && /nakama/nakama --name nakama1 --database.address postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_DB?sslmode=prefer --logger.level DEBUG --session.token_expiry_sec 7200 --runtime.path /nakama/build"]