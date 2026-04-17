#!/bin/bash

# Quick Start Script for Multiplayer Tic-Tac-Toe
# This script sets up everything needed to run the game locally

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎮 Multiplayer Tic-Tac-Toe Quick Start${NC}"
echo "======================================"

# Step 1: Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Step 2: Build backend
echo -e "${GREEN}🔧 Building backend...${NC}"
cd backend && npm run build && cd ..

# Step 3: Build frontend  
echo -e "${GREEN}🌐 Building frontend...${NC}"
cd frontend && npm run build && cd ..

# Step 4: Start services
echo -e "${GREEN}🚀 Starting Nakama server...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for Nakama to start...${NC}"
sleep 15

# Check if Nakama is running
if curl -f http://localhost:7350/healthcheck > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nakama server is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Nakama may still be starting. Give it another minute.${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start the frontend: cd frontend && npm start"
echo "2. Open http://localhost:3000 in your browser"  
echo "3. Open a second browser window to test multiplayer"
echo ""
echo "Services running:"
echo "• Nakama Server: http://localhost:7350"
echo "• Nakama Console: http://localhost:7351 (admin/password)"
echo "• PostgreSQL: localhost:5432"
echo ""
echo "To stop services: docker-compose down"