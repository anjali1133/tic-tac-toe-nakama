# Multiplayer Tic-Tac-Toe Game with Nakama

A production-ready, multiplayer Tic-Tac-Toe game with server-authoritative architecture using Nakama as the backend infrastructure and React as the frontend.

## 🎮 Live Demo

**Game URL:** Deploy following the guide below to get your live URL!

**Features:**
- Real-time multiplayer gameplay
- Server-authoritative game logic
- Automatic matchmaking
- Responsive mobile-friendly UI
- Game room management
- Player statistics tracking

## 🏗️ Architecture

### Frontend (React)
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context + useReducer
- **WebSocket Client:** Nakama JavaScript SDK
- **Deployment:** Vercel

### Backend (Nakama)
- **Server:** Nakama 3.x
- **Language:** TypeScript (for server runtime)
- **Database:** Built-in Nakama database
- **Deployment:** Railway (free tier)

## 🚀 Quick Start

### Option 1: One-Command Setup (Fastest)
```bash
# Set up everything automatically
./quick-start.sh

# Then start frontend in a new terminal:
cd frontend && npm start

# Open http://localhost:3000 to play!
```

### Option 2: Interactive Deployment Script
```bash
# Use the deployment helper for step-by-step setup
./deploy.sh

# Follow the interactive menu to:
# 1. Check requirements
# 2. Build both frontend and backend
# 3. Test locally
# 4. Deploy to production
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

#### 1. Clone Repository
```bash
git clone <repository-url>
cd tic-tac-toe-nakama
```

#### 2. Build Backend
```bash
cd backend
npm install
npm run build
cd ..
```

#### 3. Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

#### 4. Start Nakama Server (Local Development)
```bash
# Start Nakama with Docker Compose
docker-compose up -d

# The server will be available at:
# - HTTP: http://localhost:7350
# - Console: http://localhost:7351 (admin:password)
```

#### 5. Start Frontend (Local Development)
```bash
cd frontend
npm start
# Frontend will be available at http://localhost:3000
```

## 📁 Project Structure

```
tic-tac-toe-nakama/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Nakama integration
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Nakama server configuration
│   ├── src/                # TypeScript server runtime
│   └── local.yml           # Nakama configuration
├── docker/                 # Docker configurations
│   └── docker-compose.yml  # Local development setup
└── README.md
```

## 🎯 Game Features

### Core Features
- ✅ Server-authoritative game logic
- ✅ Real-time multiplayer gameplay
- ✅ Automatic matchmaking
- ✅ Game room creation and joining
- ✅ Player connection handling
- ✅ Move validation and cheating prevention

### Optional Features (Implemented)
- ✅ Concurrent game support
- ✅ Basic player statistics
- ✅ Game room isolation
- 🚧 Leaderboard system (planned)
- 🚧 Timer-based game mode (planned)

## 🔧 Development

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests (if implemented)
cd backend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Backend is deployed as-is with Nakama
```

## 🌐 Deployment Guide

**📖 For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

### Quick Deploy Summary

#### 1. **Deploy Backend to Railway** (Free)
- Create account at [railway.app](https://railway.app)
- Deploy from GitHub repository
- Add PostgreSQL database
- Set environment variables

#### 2. **Deploy Frontend to Vercel** (Free)
- Create account at [vercel.com](https://vercel.com)  
- Connect GitHub repository
- Set environment variables pointing to Railway backend
- Deploy automatically

#### 3. **Use Deployment Script**
```bash
./deploy.sh
# Choose option 6 to setup deployment configs
# Choose option 7 to deploy frontend to Vercel
```

### Free Hosting Platforms

#### Backend Options:
- **Railway** ⭐ (Recommended) - $5 monthly credit
- **Fly.io** - Great Docker support
- **Render.com** - Simple deployment
- **DigitalOcean App Platform** - Managed containers

#### Frontend Options:  
- **Vercel** ⭐ (Recommended) - Excellent React support
- **Netlify** - Great static hosting
- **GitHub Pages** - Free for public repos
- **Firebase Hosting** - Google's platform

## 🔑 Environment Configuration

### Local Development (.env files)

**Frontend (.env):**
```env
REACT_APP_NAKAMA_HOST=localhost
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_USE_SSL=false
```

**Backend (docker-compose.yml):**
```yaml
environment:
  NAKAMA_DATABASE_URL: postgres://...
  NAKAMA_SOCKET_SERVER_KEY: defaultkey
```

## 🎮 How to Play

1. **Access the Game:** Visit the deployed URL
2. **Create/Join Game:** 
   - Click "Create Game" to start a new room
   - Or click "Join Game" to enter matchmaking
3. **Gameplay:** 
   - Take turns clicking on the grid
   - First player to get 3 in a row wins
   - Game state updates in real-time

## 🧪 Testing Multiplayer Functionality

1. **Open Multiple Browser Windows/Tabs:**
   - Navigate to the game URL in each
   - Use different browser profiles or incognito mode

2. **Test Matchmaking:**
   - Click "Join Game" in both windows
   - Verify players are matched automatically

3. **Test Gameplay:**
   - Make moves in alternating windows
   - Verify real-time updates
   - Test win/draw conditions

4. **Test Reconnection:**
   - Refresh one browser window during gameplay
   - Verify game state is restored

## 🐛 Troubleshooting

### Common Issues

**Frontend won't connect to Nakama:**
- Check CORS settings in Nakama config
- Verify environment variables
- Check browser console for errors

**Docker issues:**
- Ensure Docker is running
- Check port conflicts (7350, 7351)
- Restart containers: `docker-compose restart`

**Deployment issues:**
- Verify environment variables in deployment platform
- Check build logs for errors
- Ensure all dependencies are listed in package.json

## 📊 Performance Considerations

- **Concurrent Games:** Server supports multiple simultaneous games
- **Scalability:** Nakama is designed for high concurrency
- **Network:** WebSocket connections for real-time updates
- **Mobile:** Responsive design optimized for mobile devices

## 🔐 Security Features

- Server-side move validation
- Protection against client-side manipulation
- Secure WebSocket connections (WSS in production)
- Rate limiting (configured in Nakama)

## 📈 Future Enhancements

- [ ] Tournament system
- [ ] Spectator mode
- [ ] Chat functionality
- [ ] Player profiles and avatars
- [ ] Advanced statistics and analytics
- [ ] AI opponent option
- [ ] Custom game rooms with passwords

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Nakama documentation: [heroiclabs.com/docs](https://heroiclabs.com/docs)
