# Multiplayer Tic-Tac-Toe with Nakama

A production-ready, real-time multiplayer Tic-Tac-Toe game built with **Nakama** backend and **React** frontend. Features server-authoritative gameplay, matchmaking, leaderboards, and deployment-ready configuration.

## 🚀 Features

### Core Gameplay
- **Real-time multiplayer** for 2 players
- **Server-authoritative** game logic (anti-cheat)
- **WebSocket** real-time communication  
- **Automatic matchmaking** system
- **Move timer** (30 seconds per turn)
- **Reconnection handling**

### Advanced Features
- **Player statistics** tracking
- **Global leaderboard**
- **Multiple concurrent matches**
- **Responsive mobile-friendly UI**
- **Production-ready deployment**

## 🏗️ Architecture

### Backend (Nakama)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Client   │◄──►│   Nakama Server  │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (TypeScript)   │    │   (Database)    │ 
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
    WebSocket                Game Logic              Player Data
  Authentication           Match Management          Statistics
   UI Updates              Server Authority          Leaderboards
```

### How Multiplayer Works

1. **Authentication**: Players authenticate with username (device ID)
2. **Matchmaking**: Server finds/creates match rooms for 2 players
3. **Game State**: All game state managed server-side (board, turns, validation)
4. **Moves**: Client sends move requests, server validates & broadcasts updates
5. **Real-time**: WebSocket ensures instant updates to both players
6. **Anti-cheat**: Server validates every move, preventing invalid actions

## 🛠️ Tech Stack

### Backend
- **Nakama Server** - Game backend framework
- **TypeScript** - Runtime language
- **PostgreSQL** - Database for persistence
- **Docker** - Containerization

### Frontend  
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Nakama JS Client** - WebSocket connection
- **CSS3** - Responsive styling

### Deployment
- **Railway** - Backend hosting
- **Vercel** - Frontend hosting  
- **Docker Compose** - Local development

## 🚦 Quick Start

### Prerequisites
- **Node.js 18+**
- **Docker & Docker Compose**
- **Git**

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd tic-tac-toe-nakama
```

2. **Start the backend services**
```bash
docker-compose up -d postgres
cd backend
npm install
npm run build
npm run dev
```

3. **Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Open two browser windows**
- Visit `http://localhost:3000`
- Enter different usernames in each window
- Click "Find Match" to connect players

### Docker Development (Recommended)

1. **Run everything with Docker**
```bash
docker-compose up --build
```

2. **Access the application**
- Frontend: `http://localhost:3000`
- Nakama Console: `http://localhost:7351` (admin/password)
- API: `http://localhost:7349`

## 🌐 Production Deployment

### Backend (Railway)

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Deploy backend**
```bash
./deploy-railway.sh
```

3. **Configure Railway**
- Add PostgreSQL service in Railway dashboard
- Set environment variables:
  - `POSTGRES_HOST`
  - `POSTGRES_DB` 
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`

### Frontend (Vercel)

1. **Install Vercel CLI**
```bash  
npm install -g vercel
```

2. **Deploy frontend**
```bash
./deploy-vercel.sh
```

3. **Configure Vercel**
Set environment variables in Vercel dashboard:
- `VITE_NAKAMA_SERVER_URL` - Your Railway domain
- `VITE_NAKAMA_SERVER_PORT` - `443`
- `VITE_NAKAMA_USE_SSL` - `true`

## 🧪 Testing Multiplayer Locally

### Method 1: Two Browser Windows
1. Open `http://localhost:3000` in two windows
2. Use different usernames (e.g., "Player1", "Player2")  
3. Click "Find Match" in both windows
4. Players will be automatically matched

### Method 2: Incognito + Regular
1. Regular window: `http://localhost:3000` 
2. Incognito window: `http://localhost:3000`
3. Use different usernames
4. Both find matches to connect

### Method 3: Different Devices
1. Find your local IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
2. Access `http://[YOUR_IP]:3000` from phones/tablets
3. Use different usernames on each device

## 📁 Project Structure

```
tic-tac-toe-nakama/
├── backend/                    # Nakama server
│   ├── src/
│   │   └── index.ts           # Game logic & match handlers
│   ├── Dockerfile             # Backend container  
│   ├── package.json           # Dependencies
│   └── nakama-config.yml      # Nakama configuration
│
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # Nakama client service
│   │   ├── types/             # TypeScript interfaces  
│   │   └── styles/            # CSS styles
│   ├── Dockerfile             # Frontend container
│   └── package.json           # Dependencies
│
├── docker-compose.yml         # Local development
├── deploy-railway.sh          # Backend deployment
└── deploy-vercel.sh           # Frontend deployment
```

## 🎮 Game Rules

### Objective
Get 3 of your symbols (X or O) in a row - horizontally, vertically, or diagonally.

### Gameplay
1. **Join Match**: Automatic matchmaking pairs you with another player
2. **Take Turns**: X always goes first, then alternates  
3. **Make Moves**: Click empty squares to place your symbol
4. **Time Limit**: 30 seconds per move (timeout = automatic loss)
5. **Win Conditions**: 
   - 3 in a row = Win
   - Board full = Draw
   - Opponent disconnects = Win
   - Timeout = Loss

### Scoring
- **Win**: +1 to wins counter & leaderboard
- **Loss**: +1 to losses counter  
- **Draw**: +1 to draws counter
- **Stats**: Tracked persistently per player

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgres://user:pass@host:5432/nakama
NAKAMA_HTTP_KEY=your-http-key
NAKAMA_SERVER_KEY=your-server-key
```

#### Frontend (.env)
```bash
VITE_NAKAMA_SERVER_URL=localhost           # Dev: localhost, Prod: your-domain
VITE_NAKAMA_SERVER_PORT=7350              # Dev: 7350, Prod: 443  
VITE_NAKAMA_USE_SSL=false                 # Dev: false, Prod: true
```

### Nakama Configuration
Key settings in `backend/nakama-config.yml`:
- **Database**: PostgreSQL connection
- **Socket**: WebSocket port (7350)  
- **Session**: Token expiry (2 hours)
- **Runtime**: TypeScript module path

## 🚨 Troubleshooting

### Backend Issues
**Nakama won't start**
- Check PostgreSQL is running: `docker ps`
- Verify database connection in logs  
- Ensure TypeScript compiled: `npm run build`

**Match not found**  
- Check Nakama console logs
- Verify matchmaking RPC is registered
- Test with curl: `curl http://localhost:7349/v2/rpc/find_match`

### Frontend Issues  
**Can't connect to Nakama**
- Verify Nakama is running on correct port
- Check CORS settings in Nakama config
- Confirm environment variables are set

**WebSocket connection fails**
- Check firewall blocking port 7350
- Verify SSL/TLS settings match (dev vs prod)  
- Test connection in browser dev tools

### Deployment Issues
**Railway deployment fails**
- Ensure Dockerfile builds locally first
- Check Railway logs for specific errors
- Verify PostgreSQL service is added

**Vercel deployment fails**  
- Check build command in vercel.json
- Verify all environment variables are set
- Test build locally: `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`  
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit Pull Request

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🙋‍♂️ Support

- **Issues**: Open GitHub issue for bugs/features
- **Documentation**: Check Nakama docs at https://heroiclabs.com/docs/
- **Community**: Join Nakama Discord for help

---

**Happy Gaming! 🎮**