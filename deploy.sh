#!/bin/bash

# Multiplayer Tic-Tac-Toe Deployment Script
# This script helps automate the deployment process

set -e  # Exit on any error

echo "🎮 Multiplayer Tic-Tac-Toe Deployment Helper"
echo "============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_header "\n📋 Checking Requirements..."
    
    commands=("node" "npm" "git" "docker")
    missing=()
    
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            missing+=($cmd)
        else
            print_status "$cmd is installed"
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing[*]}"
        echo "Please install the missing tools and run this script again."
        exit 1
    fi
    
    print_status "All requirements satisfied!"
}

# Build the backend
build_backend() {
    print_header "\n🔧 Building Backend..."
    
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "Backend package.json not found"
        exit 1
    fi
    
    print_status "Installing backend dependencies..."
    npm install
    
    print_status "Compiling TypeScript..."
    npm run build
    
    if [ ! -f "modules/index.js" ]; then
        print_error "Backend compilation failed - index.js not found"
        exit 1
    fi
    
    print_status "Backend build completed!"
    cd ..
}

# Build the frontend
build_frontend() {
    print_header "\n🌐 Building Frontend..."
    
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "Frontend package.json not found"
        exit 1
    fi
    
    print_status "Installing frontend dependencies..."
    npm install
    
    print_status "Building React app..."
    npm run build
    
    if [ ! -d "build" ]; then
        print_error "Frontend build failed - build directory not found"
        exit 1
    fi
    
    print_status "Frontend build completed!"
    cd ..
}

# Test local deployment with Docker
test_local() {
    print_header "\n🧪 Testing Local Deployment..."
    
    print_status "Starting services with Docker Compose..."
    docker-compose up -d
    
    print_status "Waiting for services to start..."
    sleep 10
    
    # Test if Nakama is responding
    if curl -f http://localhost:7350/healthcheck > /dev/null 2>&1; then
        print_status "Nakama server is running!"
    else
        print_warning "Nakama server may not be ready yet. Check docker-compose logs"
    fi
    
    print_status "Local services started. You can now:"
    echo "  - Access Nakama Console: http://localhost:7351 (admin/password)"
    echo "  - Test API: http://localhost:7350"
    echo "  - Start frontend: cd frontend && npm start"
    echo ""
    echo "To stop services: docker-compose down"
}

# Setup deployment configurations
setup_deployment() {
    print_header "\n⚙️  Setting up Deployment Configurations..."
    
    read -p "Enter your Railway app URL (e.g., myapp.railway.app): " railway_url
    read -p "Enter your Vercel app URL (e.g., myapp.vercel.app): " vercel_url
    
    # Update frontend environment for production
    cat > frontend/.env.production << EOF
REACT_APP_NAKAMA_HOST=${railway_url}
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
EOF
    
    # Update vercel.json with correct environment
    cat > frontend/vercel.json << EOF
{
  "name": "tic-tac-toe-frontend",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/\$1"
    }
  ],
  "env": {
    "REACT_APP_NAKAMA_HOST": "${railway_url}",
    "REACT_APP_NAKAMA_PORT": "443",
    "REACT_APP_NAKAMA_USE_SSL": "true"
  }
}
EOF
    
    print_status "Deployment configurations updated!"
    print_status "Railway URL: ${railway_url}"
    print_status "Vercel URL: ${vercel_url}"
}

# Deploy to Vercel
deploy_frontend() {
    print_header "\n🚀 Deploying Frontend to Vercel..."
    
    cd frontend
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_status "Deploying to Vercel..."
    vercel --prod
    
    cd ..
    print_status "Frontend deployment initiated!"
}

# Show deployment status
show_status() {
    print_header "\n📊 Deployment Status"
    echo ""
    echo "✅ Backend: Build completed"
    echo "✅ Frontend: Build completed"
    echo "✅ Docker: Services configured"
    echo ""
    echo "🔗 Next Steps:"
    echo "1. Deploy backend to Railway: https://railway.app"
    echo "2. Deploy frontend to Vercel: Run 'npm run deploy' in frontend/"
    echo "3. Update environment variables with actual URLs"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Check requirements"
    echo "2) Build backend"
    echo "3) Build frontend" 
    echo "4) Build both"
    echo "5) Test local deployment"
    echo "6) Setup deployment configs"
    echo "7) Deploy frontend to Vercel"
    echo "8) Show status"
    echo "9) Exit"
    echo ""
}

# Main script logic
main() {
    while true; do
        show_menu
        read -p "Choose an option (1-9): " choice
        
        case $choice in
            1) check_requirements ;;
            2) build_backend ;;
            3) build_frontend ;;
            4) build_backend && build_frontend ;;
            5) test_local ;;
            6) setup_deployment ;;
            7) deploy_frontend ;;
            8) show_status ;;
            9) 
                print_status "Goodbye! 👋"
                exit 0 ;;
            *)
                print_error "Invalid option. Please choose 1-9."
                ;;
        esac
    done
}

# Run the script
main