export interface Player {
  userId: string;
  username: string;
  symbol: 'X' | 'O';
  connected: boolean;
}

export interface GameState {
  board: string[];
  currentPlayer: 'X' | 'O';
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: string | null;
  players: { [key: string]: Player };
  moveTimer: number;
  lastMove?: {
    position: number;
    player: string;
  };
  reason?: string;
}

export interface GameUpdateMessage {
  type: 'game_update';
  data: GameState;
}

export interface MoveMessage {
  position: number;
}

export interface PlayerStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  wins: number;
  rank: number;
}