import React from 'react';
import { useGameContext } from '../hooks/useGameContext';

const GameBoard: React.FC = () => {
  const { gameState, isPlayerTurn, makeMove } = useGameContext();

  const handleCellClick = async (position: number) => {
    if (!gameState || !isPlayerTurn || gameState.board[position] !== null) {
      return;
    }

    try {
      await makeMove(position);
    } catch (error) {
      console.error('Failed to make move:', error);
    }
  };

  const getCellContent = (position: number) => {
    const value = gameState?.board[position];
    return value || '';
  };

  const getCellClassName = (position: number) => {
    let className = 'game-cell';
    
    const symbol = gameState?.board[position];
    if (symbol) {
      className += ` ${symbol.toLowerCase()}`;
    }
    
    return className;
  };

  if (!gameState) {
    return (
      <div className="text-center p-4">
        <div className="text-xl text-gray">No active game</div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Game Board */}
      <div className="game-board">
        {Array.from({ length: 9 }, (_, index) => (
          <button
            key={index}
            className={getCellClassName(index)}
            onClick={() => handleCellClick(index)}
            disabled={!isPlayerTurn || gameState.gameStatus !== 'playing' || gameState.board[index] !== null}
          >
            {getCellContent(index)}
          </button>
        ))}
      </div>

      {/* Game Status */}
      <div className="text-center mt-4">
        {gameState.gameStatus === 'waiting' && (
          <div className="text-xl text-yellow font-medium">
            Waiting for another player...
          </div>
        )}
        
        {gameState.gameStatus === 'playing' && (
          <div>
            <div className="text-xl font-medium">
              {isPlayerTurn ? (
                <span className="text-green">Your turn!</span>
              ) : (
                <span className="text-gray">Opponent's turn</span>
              )}
            </div>
            
            {gameState.turnTimeLimit && gameState.turnStartTime && (
              <TurnTimer 
                startTime={gameState.turnStartTime} 
                timeLimit={gameState.turnTimeLimit}
                isActive={gameState.gameStatus === 'playing'}
              />
            )}
          </div>
        )}
        
        {gameState.gameStatus === 'finished' && (
          <div>
            {gameState.winner ? (
              <div className="text-2xl font-bold">
                {gameState.players[gameState.winner] ? (
                  <span className="text-green">
                    {gameState.players[gameState.winner].name} wins!
                  </span>
                ) : (
                  <span className="text-green">Game finished!</span>
                )}
              </div>
            ) : gameState.isDraw ? (
              <div className="text-2xl font-bold text-yellow">
                It's a draw!
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray">
                Game ended
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Turn timer component
interface TurnTimerProps {
  startTime: number;
  timeLimit: number;
  isActive: boolean;
}

const TurnTimer: React.FC<TurnTimerProps> = ({ startTime, timeLimit, isActive }) => {
  const [timeLeft, setTimeLeft] = React.useState(timeLimit);

  React.useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, timeLimit, isActive]);

  const seconds = Math.ceil(timeLeft / 1000);
  const isWarning = seconds <= 10;

  return (
    <div className={isWarning ? 'text-red' : 'text-gray'} style={{ fontFamily: 'monospace', fontSize: '14px' }}>
      Time: {seconds}s
    </div>
  );
};

export default GameBoard;