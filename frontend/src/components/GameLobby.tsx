import React, { useState } from 'react';
import { useGameContext } from '../hooks/useGameContext';

const GameLobby: React.FC = () => {
  const { connectionState, createGame, joinMatchmaking, connect } = useGameContext();
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningMatchmaking, setIsJoiningMatchmaking] = useState(false);

  const handleCreateGame = async () => {
    setIsCreatingGame(true);
    try {
      await createGame();
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleJoinMatchmaking = async () => {
    setIsJoiningMatchmaking(true);
    try {
      await joinMatchmaking();
    } catch (error) {
      console.error('Failed to join matchmaking:', error);
      alert('Failed to join matchmaking. Please try again.');
    } finally {
      setIsJoiningMatchmaking(false);
    }
  };

  const handleReconnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
      alert('Failed to reconnect. Please try again.');
    }
  };

  // Connection status display
  if (connectionState.connecting) {
    return (
      <div className="game-container" style={{ minHeight: '100vh' }}>
        <div className="card text-center">
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <h2 className="text-xl font-bold mb-4">Connecting...</h2>
          <p className="text-gray">Connecting to game server</p>
        </div>
      </div>
    );
  }

  if (!connectionState.connected) {
    return (
      <div className="game-container" style={{ minHeight: '100vh' }}>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⚠️</div>
          <h2 className="text-xl font-bold mb-4">Connection Failed</h2>
          <p className="text-gray mb-4">
            {connectionState.error || 'Could not connect to game server'}
          </p>
          <button
            onClick={handleReconnect}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main lobby interface
  return (
    <div className="game-container" style={{ minHeight: '100vh' }}>
      <div className="card">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-4">
            Tic-Tac-Toe
          </h1>
          <p className="text-gray">
            Multiplayer online game
          </p>
          <div className="text-center mt-4" style={{ fontSize: '14px', color: '#388e3c' }}>
            <span className="status-dot green"></span>
            Connected to server
          </div>
        </div>

        {/* Game Options */}
        <div style={{ marginBottom: '20px' }}>
          {/* Create Game */}
          <button
            onClick={handleCreateGame}
            disabled={isCreatingGame}
            className="btn btn-primary mb-4"
            style={{ marginBottom: '16px' }}
          >
            {isCreatingGame ? (
              <>
                <div className="spinner"></div>
                <span>Creating Game...</span>
              </>
            ) : (
              <>
                <span>🎮</span>
                <span>Create New Game</span>
              </>
            )}
          </button>

          {/* Join Matchmaking */}
          <button
            onClick={handleJoinMatchmaking}
            disabled={isJoiningMatchmaking}
            className="btn btn-success"
          >
            {isJoiningMatchmaking ? (
              <>
                <div className="spinner"></div>
                <span>Finding Match...</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>Quick Match</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px', marginTop: '20px' }}>
          <h3 className="font-medium mb-4">How to Play</h3>
          <ul style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            <li>• Create a game to invite others</li>
            <li>• Quick Match finds an opponent automatically</li>
            <li>• First to get 3 in a row wins!</li>
            <li>• You have 30 seconds per turn</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center mt-4" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', fontSize: '12px', color: '#999' }}>
          <p>Built with Nakama & React</p>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;