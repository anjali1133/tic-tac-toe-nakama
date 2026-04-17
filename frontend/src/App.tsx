import React from 'react';
import { GameProvider, useGameContext } from './hooks/useGameContext';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import PlayerInfo from './components/PlayerInfo';

// Main game component that renders based on game state
const GameApp: React.FC = () => {
  const { gameState, connectionState } = useGameContext();

  // Show lobby if not connected or no game active
  if (!connectionState.connected || !gameState) {
    return <GameLobby />;
  }

  // Show game interface when in a match
  return (
    <div className="container">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-4">
          Tic-Tac-Toe
        </h1>
        <p className="text-gray">
          Multiplayer Game
        </p>
      </div>

      {/* Game Content */}
      <div className="game-container">
        {/* Player Info Sidebar */}
        <div style={{ order: 2 }}>
          <PlayerInfo />
        </div>

        {/* Game Board */}
        <div style={{ order: 1 }}>
          <GameBoard />
        </div>

        {/* Additional Info or Future Features */}
        <div style={{ order: 3 }}>
          <div className="card">
            <h3 className="text-xl font-bold mb-4">
              Game Rules
            </h3>
            <ul style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              <li>• Take turns placing your symbol</li>
              <li>• Get 3 in a row to win</li>
              <li>• You have 30 seconds per turn</li>
              <li>• First player is always X</li>
              <li>• Game ends in draw if board fills</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App component with GameProvider
function App() {
  return (
    <GameProvider>
      <div className="App">
        <GameApp />
      </div>
    </GameProvider>
  );
}

export default App;
