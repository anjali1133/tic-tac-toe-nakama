# Deployment Guide for Multiplayer Tic-Tac-Toe

This guide provides step-by-step instructions for deploying your multiplayer Tic-Tac-Toe game using free hosting services.

## 🚀 Quick Deployment Summary

**Frontend:** React app deployed on Vercel  
**Backend:** Nakama server deployed on Railway  
**Database:** PostgreSQL provided by Railway  

## 📋 Prerequisites

- Git repository (GitHub recommended)
- Vercel account (free)
- Railway account (free)
- Node.js 18+ (for local development)

## 🔧 Backend Deployment (Railway)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Verify your account

### Step 2: Deploy Nakama Server
1. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

2. **Configure Build Settings:**
   - Railway should auto-detect the Dockerfile
   - Set build context to `/backend`
   - Use `backend/Dockerfile.railway`

3. **Add PostgreSQL Database:**
   - In your project dashboard
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will provision a free PostgreSQL instance

4. **Set Environment Variables:**
   ```bash
   NAKAMA_DATABASE_URL=${{Postgres.DATABASE_URL}}
   NAKAMA_SOCKET_SERVER_KEY=your-secure-key-here
   NAKAMA_RUNTIME_PATH=/nakama/data/modules
   ```

5. **Configure Port:**
   - Set PORT environment variable to `7350`
   - Railway will assign a public URL

### Step 3: Update Nakama Configuration
1. **Create railway-specific config:**
   ```yaml
   # backend/railway.yml
   name: tic-tac-toe-nakama-railway
   data_dir: "./data/"

   logger:
     stdout: true
     level: "INFO"

   session:
     encryption_key: "your-encryption-key"
     token_expiry_sec: 7200

   socket:
     server_key: "your-socket-key"
     port: 7350

   database:
     # Uses DATABASE_URL environment variable
   
   runtime:
     path: "/nakama/data/modules"
     js_entrypoint: "index.js"

   console:
     port: 7351
     username: "admin"
     password: "secure-password"
   ```

2. **Update Dockerfile:**
   ```dockerfile
   FROM heroiclabs/nakama:3.21.1

   COPY --chown=nakama:nakama ./railway.yml /nakama/data/local.yml
   COPY --chown=nakama:nakama ./modules /nakama/data/modules

   EXPOSE 7350 7351

   CMD ["/nakama/nakama", "--config", "/nakama/data/local.yml"]
   ```

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update environment variables:**
   Create `frontend/.env.production`:
   ```env
   REACT_APP_NAKAMA_HOST=your-railway-app.railway.app
   REACT_APP_NAKAMA_PORT=443
   REACT_APP_NAKAMA_USE_SSL=true
   ```

2. **Update vercel.json:**
   ```json
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
         "dest": "/$1"
       }
     ],
     "env": {
       "REACT_APP_NAKAMA_HOST": "your-railway-nakama.railway.app",
       "REACT_APP_NAKAMA_PORT": "443",
       "REACT_APP_NAKAMA_USE_SSL": "true"
     }
   }
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from frontend directory:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Or deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build settings:
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`

4. **Set Environment Variables in Vercel:**
   - Project Settings → Environment Variables
   - Add production environment variables

## 🔄 Alternative Deployment Options

### Backend Alternatives

#### 1. Fly.io (Recommended Alternative)
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
cd backend
fly launch --name your-app-name
fly deploy
```

#### 2. Render.com
1. Connect GitHub repository
2. Create new Web Service
3. Use Docker build
4. Set environment variables

#### 3. DigitalOcean App Platform
1. Create new app from GitHub
2. Configure Dockerfile build
3. Add managed PostgreSQL database

### Frontend Alternatives

#### 1. Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
npm run build
netlify deploy --prod --dir=build
```

#### 2. GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   {
     "homepage": "https://username.github.io/repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```
3. Run: `npm run deploy`

## 🛠️ Local Development Setup

### Start Backend (Local)
```bash
# Start with Docker Compose
docker-compose up -d

# Or start manually
cd backend
npm run build
docker build -t tic-tac-toe-nakama .
docker run -p 7350:7350 -p 7351:7351 tic-tac-toe-nakama
```

### Start Frontend (Local)
```bash
cd frontend
npm install
npm start
```

## 🔍 Testing Your Deployment

### 1. Backend Health Check
```bash
curl https://your-railway-app.railway.app/healthcheck
```

### 2. Frontend Access
- Open your Vercel URL
- Should see the game lobby
- Check browser console for connection errors

### 3. Multiplayer Testing
1. Open game in two different browsers/devices
2. One player creates game
3. Other player joins via matchmaking
4. Test gameplay functionality

## 🐛 Troubleshooting

### Common Backend Issues

**Issue: Database connection failed**
```bash
# Check DATABASE_URL format
postgres://user:pass@host:port/database?sslmode=require
```

**Issue: CORS errors**
- Ensure Nakama config allows frontend domain
- Check socket server key matches

**Issue: Module not found**
- Verify TypeScript compilation
- Check modules directory in Docker image

### Common Frontend Issues

**Issue: Can't connect to backend**
- Verify NAKAMA_HOST environment variable
- Check if backend is running
- Verify SSL/port settings

**Issue: Build failures**
- Clear node_modules and npm cache
- Check TypeScript errors
- Verify all dependencies installed

### Environment Variables Checklist

**Backend (Railway):**
- ✅ `NAKAMA_DATABASE_URL`
- ✅ `NAKAMA_SOCKET_SERVER_KEY`
- ✅ `PORT=7350`

**Frontend (Vercel):**
- ✅ `REACT_APP_NAKAMA_HOST`
- ✅ `REACT_APP_NAKAMA_PORT`
- ✅ `REACT_APP_NAKAMA_USE_SSL`

## 📊 Monitoring & Maintenance

### Railway Monitoring
- Check deployment logs in Railway dashboard
- Monitor database usage
- Set up alerts for downtime

### Vercel Monitoring
- Check build logs
- Monitor function invocations
- Set up domain monitoring

### Performance Optimization
- Enable Vercel Analytics
- Monitor WebSocket connection stability
- Optimize bundle size if needed

## 💰 Cost Considerations

### Free Tier Limits

**Railway:**
- $5 credit per month
- Up to 500 hours execution time
- 1GB RAM, 1vCPU
- 1GB PostgreSQL storage

**Vercel:**
- 100GB bandwidth per month
- Unlimited static deployments
- 10 serverless functions

### Scaling Options
- Railway: Upgrade to Pro plan ($20/month)
- Vercel: Upgrade to Pro plan ($20/month)
- Consider dedicated game servers for high traffic

## 🔐 Security Best Practices

1. **Change Default Passwords:**
   - Nakama console password
   - Database credentials

2. **Use Environment Variables:**
   - Never commit secrets to Git
   - Use different keys for production

3. **Enable HTTPS:**
   - Both platforms provide SSL by default
   - Ensure WSS is used for WebSocket connections

4. **Monitor Access:**
   - Check logs regularly
   - Set up alerting for unusual activity

## 📈 Next Steps

After successful deployment:

1. **Domain Setup:**
   - Add custom domain to Vercel
   - Update CORS settings in Nakama

2. **Analytics:**
   - Add Google Analytics
   - Monitor player engagement

3. **Features:**
   - Implement leaderboards
   - Add player statistics
   - Create tournaments

4. **Performance:**
   - Add CDN for assets
   - Implement caching strategies
   - Monitor server performance

## 📞 Support Resources

- **Nakama Documentation:** [heroiclabs.com/docs](https://heroiclabs.com/docs)
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **React Deployment:** [create-react-app.dev/docs/deployment](https://create-react-app.dev/docs/deployment)

---

**🎉 Congratulations!** You now have a fully deployed multiplayer Tic-Tac-Toe game that players can access from anywhere in the world!