#!/bin/bash

# Deploy Frontend to Vercel
echo "🚀 Deploying Tic-Tac-Toe Frontend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Move to frontend directory
cd frontend

# Login to Vercel (if not already logged in)
echo "📝 Logging into Vercel..."
vercel login

# Deploy
echo "🚢 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed!"
echo "🔧 Don't forget to set environment variables in Vercel dashboard:"
echo "   - VITE_NAKAMA_SERVER_URL (your Railway domain)"
echo "   - VITE_NAKAMA_SERVER_PORT (443 for HTTPS)"
echo "   - VITE_NAKAMA_USE_SSL (true)"