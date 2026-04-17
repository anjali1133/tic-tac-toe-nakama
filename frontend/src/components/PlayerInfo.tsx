import React from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { nakamaService } from '../services/nakama';

const PlayerInfo: React.FC = () => {
  const { gameState, leaveGame } = useGameContext();

  const currentUserId = nakamaService.getCurrentUser();
  
  const handleLeaveGame = async () => {
    const confirmed = window.confirm('Are you sure you want to leave the game?');
    if (confirmed) {
      try {
        await leaveGame();
      } catch (error) {
        console.error('Failed to leave game:', error);
      }
    }
  };

  if (!gameState || !currentUserId) {
    return null;
  }

  const players = Object.entries(gameState.players);
  const currentPlayer = gameState.players[currentUserId];
  const opponent = players.find(([id]) => id !== currentUserId)?.[1];

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="text-xl font-bold">Game Info</h2>
        <button
          onClick={handleLeaveGame}
          className="text-red"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          Leave Game
        </button>
      </div>

      {/* Players */}
      <div>
        {/* Current Player */}
        {currentPlayer && (
          <div className="player-card current">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={`player-symbol ${currentPlayer.symbol.toLowerCase()}`}>
                {currentPlayer.symbol}
              </div>
              <div>
                <div className="font-medium">You</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{currentPlayer.name}</div>
              </div>
            </div>
            {gameState.currentPlayer === currentUserId && gameState.gameStatus === 'playing' && (
              <div className="text-green" style={{ fontSize: '14px', fontWeight: '500' }}>Your Turn</div>
            )}
          </div>
        )}

        {/* Opponent */}
        {opponent ? (
          <div className="player-card opponent">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={`player-symbol ${opponent.symbol.toLowerCase()}`}>
                {opponent.symbol}
              </div>
              <div>
                <div className="font-medium">Opponent</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{opponent.name}</div>
              </div>
            </div>
            {gameState.currentPlayer !== currentUserId && gameState.gameStatus === 'playing' && (
              <div className="text-yellow" style={{ fontSize: '14px', fontWeight: '500' }}>Their Turn</div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '12px', 
            background: '#fff8e1', 
            border: '2px solid #ffcc02', 
            borderRadius: '8px',
            marginBottom: '8px'
          }}>
            <div className="font-medium text-yellow" style={{ marginBottom: '4px' }}>
              Waiting for opponent...
            </div>
            <div style={{ fontSize: '12px', color: '#f57c00' }}>
              Share this game to invite someone!
            </div>
          </div>
        )}
      </div>

      {/* Game Status Summary */}
      <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
          <span className="text-gray">Status:</span>
          <span className={`font-medium ${
            gameState.gameStatus === 'playing' ? 'text-green' :
            gameState.gameStatus === 'waiting' ? 'text-yellow' :
            'text-gray'
          }`}>
            {gameState.gameStatus === 'playing' && 'Playing'}
            {gameState.gameStatus === 'waiting' && 'Waiting'}
            {gameState.gameStatus === 'finished' && 'Finished'}
          </span>
        </div>
        
        {gameState.gameStatus === 'finished' && (
          <div className="text-center mt-4">
            <button
              onClick={() => window.location.reload()}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#1976d2', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerInfo;