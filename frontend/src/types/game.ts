export interface GameState {
  board: (string | null)[];
  currentPlayer: string;
  players: { [userId: string]: Player };
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: string | null;
  isDraw: boolean;
  turnTimeLimit?: number;
  turnStartTime?: number;
}

export interface Player {
  symbol: 'X' | 'O';
  name: string;
}

export interface GameMove {
  position: number;
  playerId: string;
}

export interface GameMessage {
  type: 'gameState' | 'move' | 'gameEnd';
  state?: GameState;
  position?: number;
  symbol?: string;
  nextPlayer?: string;
  reason?: 'winner' | 'draw' | 'timeout';
  winner?: string;
}

export interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export interface MatchInfo {
  matchId: string;
  players: Player[];
  spectators: number;
}