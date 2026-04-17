#!/bin/bash

echo "🧪 Testing Railway deployment build..."

# Test if all files exist in expected locations
echo "📁 Checking file structure..."

if [ ! -f "backend/package.json" ]; then
    echo "❌ Missing: backend/package.json"
    exit 1
fi

if [ ! -f "backend/tsconfig.json" ]; then
    echo "❌ Missing: backend/tsconfig.json"
    exit 1
fi

if [ ! -f "backend/nakama-config.yml" ]; then
    echo "❌ Missing: backend/nakama-config.yml"
    exit 1
fi

if [ ! -d "backend/src" ]; then
    echo "❌ Missing: backend/src directory"
    exit 1
fi

if [ ! -f "backend/Dockerfile.railway" ]; then
    echo "❌ Missing: backend/Dockerfile.railway"
    exit 1
fi

if [ ! -f "railway.toml" ]; then
    echo "❌ Missing: railway.toml in root"
    exit 1
fi

echo "✅ All required files present"

# Test TypeScript compilation in backend
echo "🔨 Testing TypeScript compilation..."
cd backend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
    echo "✅ Build directory created: $(ls -la build/)"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

cd ..

echo "🎉 All tests passed! Railway deployment should work."
echo "📋 Next steps:"
echo "   1. Install Railway CLI: npm install -g @railway/cli"
echo "   2. Login: railway login"
echo "   3. Deploy: ./deploy-railway.sh"
echo "   4. Set up PostgreSQL service in Railway dashboard"
echo "   5. Configure environment variables in Railway"