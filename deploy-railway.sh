#!/bin/bash

# Deploy Backend to Railway
echo "🚀 Deploying Tic-Tac-Toe Backend to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "📝 Logging into Railway..."
railway login

# Create or link to Railway project
echo "🔗 Linking to Railway project..."

# Initialize Railway project from root if not already done
if [ ! -f "railway.toml" ]; then
    echo "🆕 Creating new Railway project..."
    railway init
fi

# Deploy from root directory
echo "🚢 Deploying to Railway..."
railway up --detach

echo "✅ Backend deployment completed!"
echo "🔧 Don't forget to:"
echo "   1. Add PostgreSQL service in Railway dashboard"
echo "   2. Set environment variables:"
echo "      - POSTGRES_HOST"
echo "      - POSTGRES_DB"
echo "      - POSTGRES_USER" 
echo "      - POSTGRES_PASSWORD"
echo "   3. Note your Railway domain for frontend config"
