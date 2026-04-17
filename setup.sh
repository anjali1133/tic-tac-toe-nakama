#!/bin/bash

echo "🎮 Setting up Multiplayer Tic-Tac-Toe..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker from https://docker.com"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose"
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed!"

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed!"

# Build backend
echo "🔨 Building backend..."
cd ../backend
npm run build
echo "✅ Backend built successfully!"

# Create environment file for frontend
echo "⚙️ Setting up environment..."
cd ../frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created frontend .env file"
else
    echo "ℹ️ Frontend .env file already exists"
fi

cd ..
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start development:"
echo "   1. Start services:    docker-compose up -d"
echo "   2. Open frontend:     http://localhost:3000"
echo "   3. Open two tabs with different usernames to test multiplayer"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs:          docker-compose logs -f"
echo "   - Stop services:      docker-compose down"  
echo "   - Rebuild:            docker-compose up --build"
echo ""
echo "📚 Check README.md for full documentation!"