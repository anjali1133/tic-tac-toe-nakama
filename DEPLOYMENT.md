# 🚀 Deployment Guide

Step-by-step guide to deploy your Multiplayer Tic-Tac-Toe game to production.

## 📋 Prerequisites

- Railway account (for backend)
- Vercel account (for frontend)  
- Domain name (optional, but recommended)

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Railway

1. **Sign up** at [railway.app](https://railway.app)
2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```
3. **Login to Railway**:
   ```bash
   railway login
   ```

### Step 2: Create Railway Project

1. **Navigate to backend**:
   ```bash
   cd backend
   ```

2. **Initialize Railway project**:
   ```bash
   railway init
   ```
   
3. **Add PostgreSQL service**:
   - Go to Railway dashboard
   - Click "New Service" → "PostgreSQL"
   - Note the database URL from variables

### Step 3: Configure Environment Variables

In Railway dashboard, add these variables:
```bash
POSTGRES_HOST=<your-postgres-host>
POSTGRES_DB=<your-database-name>  
POSTGRES_USER=<your-postgres-user>
POSTGRES_PASSWORD=<your-postgres-password>
```

### Step 4: Deploy

```bash
railway up
```

### Step 5: Get Your Backend URL

- Copy your Railway app URL (e.g., `https://yourapp.railway.app`)
- Note both HTTP (port 443) and WebSocket (port 443) endpoints

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Vercel  

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
3. **Login to Vercel**:
   ```bash
   vercel login
   ```

### Step 2: Configure Environment

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

2. **Set up environment variables**:
   Create `.env.production`:
   ```bash
   VITE_NAKAMA_SERVER_URL=yourapp.railway.app
   VITE_NAKAMA_SERVER_PORT=443
   VITE_NAKAMA_USE_SSL=true
   ```

### Step 3: Deploy

```bash
vercel --prod
```

### Step 4: Configure Vercel Dashboard

1. Go to Vercel dashboard
2. Select your project  
3. Go to Settings → Environment Variables
4. Add the same variables from Step 2

## ⚡ Quick Deploy Scripts

Use the included deployment scripts for faster deployment:

### Backend
```bash
./deploy-railway.sh
```

### Frontend  
```bash
./deploy-vercel.sh
```

## 🔐 Security Configuration

### Railway (Backend)
- Enable HTTPS only
- Set up proper CORS origins
- Use strong database passwords
- Enable Railway's built-in security features

### Vercel (Frontend)  
- Configure security headers
- Set up proper CSP (Content Security Policy)
- Use HTTPS redirect

### Example Security Headers (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🌍 Custom Domain Setup

### Railway Custom Domain
1. Go to Railway dashboard → Settings
2. Click "Custom Domain"
3. Add your domain (e.g., `api.yourgame.com`)
4. Update DNS records as shown

### Vercel Custom Domain  
1. Go to Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `yourgame.com`)
3. Update DNS records as shown
4. Update frontend env vars with new backend URL

## 📊 Monitoring & Maintenance

### Railway Monitoring
- **Logs**: Check Railway dashboard for real-time logs
- **Metrics**: Monitor CPU/Memory usage
- **Database**: Watch connection counts and query performance

### Vercel Monitoring
- **Analytics**: Enable Vercel Analytics for user insights  
- **Performance**: Monitor Core Web Vitals
- **Errors**: Set up error tracking

### Health Checks
Add health check endpoints:

**Backend** (add to index.ts):
```typescript
initializer.registerRpc("health", (ctx, logger, nk, payload) => {
  return JSON.stringify({ status: "healthy", timestamp: Date.now() });
});
```

**Frontend** (add route):
```
/health → returns 200 OK
```

## 🚨 Troubleshooting

### Common Railway Issues

**Build Fails**
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Review build logs in Railway dashboard

**Database Connection Issues**  
- Verify environment variables
- Check PostgreSQL service is running
- Test connection string format

**Port Issues**
- Railway auto-assigns PORT variable
- Don't hardcode ports in production

### Common Vercel Issues

**Environment Variables Not Working**
- Check variable names (must start with VITE_)  
- Redeploy after adding variables
- Verify in build logs

**Build Fails**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build command in vercel.json

**CORS Errors**
- Update Nakama CORS settings
- Check backend URL in frontend config
- Verify SSL/HTTPS settings match

## 🔄 CI/CD Setup (Optional)

### GitHub Actions for Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          cd backend && railway up

  deploy-frontend:  
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd frontend && vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

Add secrets in GitHub repository settings:
- `RAILWAY_TOKEN`
- `VERCEL_TOKEN`

## 📈 Scaling Considerations

### Backend Scaling
- **Horizontal**: Railway auto-scales based on load
- **Database**: Consider connection pooling for high traffic
- **Caching**: Add Redis for session/match caching

### Frontend Scaling  
- **CDN**: Vercel provides global CDN automatically
- **Edge Functions**: Use for geo-routing if needed
- **Caching**: Configure proper cache headers

### Cost Optimization
- **Railway**: Monitor usage, upgrade plan as needed
- **Vercel**: Optimize bundle size, use tree shaking
- **Database**: Regular cleanup of old game data

---

**🎉 Your multiplayer Tic-Tac-Toe game is now live and ready for players worldwide!**