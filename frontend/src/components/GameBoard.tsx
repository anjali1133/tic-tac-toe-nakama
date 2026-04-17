import { GameState, Player } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onMakeMove: (position: number) => void;
  canMakeMove: (position: number) => boolean;
  isMyTurn: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayer,
  onMakeMove,
  canMakeMove,
  isMyTurn
}) => {
  const getGameStatusMessage = (): string => {
    switch (gameState.gameStatus) {
      case 'waiting':
        return 'Waiting for another player to join...';
      case 'playing':
        if (isMyTurn) {
          return "It's your turn!";
        }
        const currentPlayerName = Object.values(gameState.players)
          .find(p => p.symbol === gameState.currentPlayer)?.username || 'Opponent';
        return `Waiting for ${currentPlayerName}'s move...`;
      case 'finished':
        if (gameState.winner === 'draw') {
          return "Game ended in a draw!";
        }
        if (currentPlayer && gameState.winner === currentPlayer.symbol) {
          return "You won! 🎉";
        }
        return "You lost! Better luck next time.";
      default:
        return '';
    }
  };

  const getGameStatusClass = (): string => {
    return gameState.gameStatus;
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getTimerPercentage = (): number => {
    const maxTime = 30000; // 30 seconds
    return Math.max(0, Math.min(100, (gameState.moveTimer / maxTime) * 100));
  };

  return (
    <div className="game-board-container">
      <div className={`game-status ${getGameStatusClass()}`}>
        {getGameStatusMessage()}
      </div>

      {gameState.gameStatus === 'playing' && (
        <div className="move-timer">
          <div>Time remaining: {formatTime(gameState.moveTimer)}</div>
          <div className="timer-bar">
            <div 
              className="timer-fill"
              style={{ width: `${getTimerPercentage()}%` }}
            />
          </div>
        </div>
      )}

      <div className="game-board">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            className={`game-cell ${cell.toLowerCase()}`}
            onClick={() => onMakeMove(index)}
            disabled={!canMakeMove(index)}
          >
            {cell}
          </button>
        ))}
      </div>

      {gameState.lastMove && (
        <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
          Last move: {gameState.lastMove.player} at position {gameState.lastMove.position + 1}
        </div>
      )}
    </div>
  );
};