import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useGame } from './hooks/useGame';
import { LoginScreen } from './components/LoginScreen';
import { MatchLobby } from './components/MatchLobby';
import { LoadingScreen } from './components/LoadingScreen';
import { GameBoard } from './components/GameBoard';
import { PlayerList } from './components/PlayerList';
import { PlayerStatsComponent } from './components/PlayerStats';
import { Leaderboard } from './components/Leaderboard';
import './styles/index.css';

export default function App() {
  const {
    gameState,
    isConnected,
    isAuthenticated,
    isInMatch,
    isLoading,
    playerStats,
    leaderboard,
    currentPlayer,
    authenticate,
    connectSocket,
    findMatch,
    makeMove,
    leaveMatch,
    disconnect,
    loadPlayerStats,
    loadLeaderboard,
    canMakeMove,
    isMyTurn
  } = useGame();

  // Auto-connect socket after authentication
  useEffect(() => {
    if (isAuthenticated && !isConnected && !isLoading) {
      connectSocket();
    }
  }, [isAuthenticated, isConnected, isLoading, connectSocket]);

  const handleLogin = async (username: string) => {
    try {
      await authenticate(username);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleFindMatch = async () => {
    try {
      await findMatch();
    } catch (error) {
      console.error('Find match failed:', error);
    }
  };

  const handleMakeMove = async (position: number) => {
    try {
      await makeMove(position);
    } catch (error) {
      console.error('Make move failed:', error);
    }
  };

  const handleLeaveMatch = () => {
    leaveMatch();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const renderContent = () => {
    // Not authenticated - show login
    if (!isAuthenticated) {
      return (
        <LoginScreen 
          onLogin={handleLogin}
          isLoading={isLoading}
        />
      );
    }

    // Authenticated but not connected - show loading
    if (!isConnected) {
      return <LoadingScreen message="Connecting to server..." />;
    }

    // Connected but not in match - show lobby
    if (!isInMatch) {
      return (
        <MatchLobby
          onFindMatch={handleFindMatch}
          onDisconnect={handleDisconnect}
          isLoading={isLoading}
          username={currentPlayer?.username || null}
        />
      );
    }

    // In match but no game state yet - show loading
    if (!gameState) {
      return <LoadingScreen message="Loading match..." />;
    }

    // In match with game state - show game
    return (
      <div className="game-layout">
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onMakeMove={handleMakeMove}
          canMakeMove={canMakeMove}
          isMyTurn={isMyTurn()}
        />
        
        <div className="sidebar">
          <PlayerList
            players={gameState.players}
            currentTurn={gameState.currentPlayer}
            currentUserId={currentPlayer?.userId || null}
          />
          
          <PlayerStatsComponent
            stats={playerStats}
            onRefresh={loadPlayerStats}
          />
          
          <Leaderboard
            leaderboard={leaderboard}
            currentUserId={currentPlayer?.userId || null}
            onRefresh={loadLeaderboard}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleLeaveMatch}
              className="button button-secondary"
              style={{ flex: 1 }}
            >
              Leave Match
            </button>
            
            <button
              onClick={handleDisconnect}
              className="button button-danger"
              style={{ flex: 1 }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Multiplayer Tic-Tac-Toe</h1>
        <p>Real-time multiplayer game powered by Nakama</p>
      </header>
      
      <main className="main-content">
        {renderContent()}
      </main>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}