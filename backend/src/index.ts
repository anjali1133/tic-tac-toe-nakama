// Tic-Tac-Toe Nakama Server Runtime
// Implements server-authoritative game logic with real-time multiplayer support

interface TicTacToeState {
  board: (string | null)[];
  currentPlayer: string;
  players: { [userId: string]: { symbol: 'X' | 'O'; name: string } };
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: string | null;
  isDraw: boolean;
  turnTimeLimit?: number;
  turnStartTime?: number;
}

interface GameMove {
  position: number;
  playerId: string;
}

interface MatchmakerTicket {
  ticket: string;
  userId: string;
}

const TIC_TAC_TOE_MATCH = 'tic_tac_toe_match';
const MATCHMAKER_QUERY = '+properties.mode:classic';

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
  logger.info('Tic-Tac-Toe server runtime loaded.');

  // Register RPC functions
  initializer.registerRpc('create_game', rpcCreateGame);
  initializer.registerRpc('join_matchmaking', rpcJoinMatchmaking);
  initializer.registerRpc('get_game_state', rpcGetGameState);

  // Register match handlers
  initializer.registerMatch(TIC_TAC_TOE_MATCH, {
    matchInit: matchInit,
    matchJoinAttempt: matchJoinAttempt,
    matchJoin: matchJoin,
    matchLeave: matchLeave,
    matchLoop: matchLoop,
    matchSignal: matchSignal,
    matchTerminate: matchTerminate
  });

  // Register matchmaker matched function
  initializer.registerMatchmakerMatched(matchmakerMatched);
}

// RPC function to create a new game room
const rpcCreateGame: nkruntime.RpcFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string => {
  logger.info('Creating new game room');
  
  const matchId = nk.matchCreate(TIC_TAC_TOE_MATCH, {});
  
  return JSON.stringify({
    matchId: matchId,
    message: 'Game room created successfully'
  });
};

// RPC function to join matchmaking
const rpcJoinMatchmaking: nkruntime.RpcFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string => {
  logger.info('Player joining matchmaking');
  
  const ticket = nk.matchmakerAdd([ctx.userId], MATCHMAKER_QUERY, 2, 2, 1, { mode: 'classic' });
  
  return JSON.stringify({
    ticket: ticket,
    message: 'Added to matchmaking queue'
  });
};

// RPC function to get current game state
const rpcGetGameState: nkruntime.RpcFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string => {
  const data = JSON.parse(payload);
  const matchId = data.matchId;
  
  // This would typically fetch the match state, but for simplicity we'll return a basic response
  return JSON.stringify({
    message: 'Use real-time match connection for game state'
  });
};

// Match initialization
const matchInit: nkruntime.MatchInitFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}): {state: nkruntime.MatchState, tickRate: number, label: string} => {
  logger.info('Match initialized');
  
  const state: TicTacToeState = {
    board: Array(9).fill(null),
    currentPlayer: '',
    players: {},
    gameStatus: 'waiting',
    winner: null,
    isDraw: false,
    turnTimeLimit: 30000, // 30 seconds per turn
    turnStartTime: Date.now()
  };

  return {
    state: state,
    tickRate: 1, // 1 tick per second
    label: 'Tic-Tac-Toe Game'
  };
};

// Match join attempt validation
const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: {[key: string]: any}): {state: nkruntime.MatchState, accept: boolean, rejectMessage?: string} | null => {
  const gameState = state as TicTacToeState;
  
  // Only allow 2 players maximum
  if (Object.keys(gameState.players).length >= 2) {
    return {
      state: gameState,
      accept: false,
      rejectMessage: 'Match is full'
    };
  }

  return {
    state: gameState,
    accept: true
  };
};

// Player joins match
const matchJoin: nkruntime.MatchJoinFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): {state: nkruntime.MatchState} | null => {
  let gameState = state as TicTacToeState;
  
  presences.forEach(presence => {
    if (!gameState.players[presence.userId]) {
      // Assign X to first player, O to second player
      const symbol: 'X' | 'O' = Object.keys(gameState.players).length === 0 ? 'X' : 'O';
      
      gameState.players[presence.userId] = {
        symbol: symbol,
        name: presence.username || `Player ${symbol}`
      };

      // Set the first player as current player
      if (symbol === 'X') {
        gameState.currentPlayer = presence.userId;
      }

      logger.info(`Player ${presence.username} joined as ${symbol}`);
    }
  });

  // Start game if we have 2 players
  if (Object.keys(gameState.players).length === 2) {
    gameState.gameStatus = 'playing';
    gameState.turnStartTime = Date.now();
    
    logger.info('Game started with 2 players');
  }

  // Broadcast updated game state
  dispatcher.broadcastMessage(1, JSON.stringify({
    type: 'gameState',
    state: gameState
  }));

  return {
    state: gameState
  };
};

// Player leaves match
const matchLeave: nkruntime.MatchLeaveFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): {state: nkruntime.MatchState} | null => {
  let gameState = state as TicTacToeState;
  
  presences.forEach(presence => {
    if (gameState.players[presence.userId]) {
      delete gameState.players[presence.userId];
      logger.info(`Player ${presence.username} left the game`);
    }
  });

  // End game if a player leaves during gameplay
  if (gameState.gameStatus === 'playing' && Object.keys(gameState.players).length < 2) {
    gameState.gameStatus = 'finished';
    // Declare remaining player as winner if any
    const remainingPlayers = Object.keys(gameState.players);
    if (remainingPlayers.length === 1) {
      gameState.winner = remainingPlayers[0];
    }
  }

  // Broadcast updated game state
  dispatcher.broadcastMessage(1, JSON.stringify({
    type: 'gameState',
    state: gameState
  }));

  return {
    state: gameState
  };
};

// Match loop - runs every tick
const matchLoop: nkruntime.MatchLoopFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]): {state: nkruntime.MatchState} | null => {
  let gameState = state as TicTacToeState;
  
  // Process incoming messages (player moves)
  messages.forEach(message => {
    if (message.opCode === 1) { // Move message
      const data = JSON.parse(nk.binaryToString(message.data));
      gameState = processMove(gameState, data, message.sender, logger, dispatcher);
    }
  });

  // Check for turn timeout
  if (gameState.gameStatus === 'playing' && gameState.turnTimeLimit && gameState.turnStartTime) {
    const currentTime = Date.now();
    const elapsed = currentTime - gameState.turnStartTime;
    
    if (elapsed > gameState.turnTimeLimit) {
      // Current player forfeits due to timeout
      const players = Object.keys(gameState.players);
      const otherPlayer = players.find(id => id !== gameState.currentPlayer);
      
      if (otherPlayer) {
        gameState.winner = otherPlayer;
        gameState.gameStatus = 'finished';
        
        dispatcher.broadcastMessage(1, JSON.stringify({
          type: 'gameEnd',
          reason: 'timeout',
          winner: otherPlayer,
          state: gameState
        }));
      }
    }
  }

  return {
    state: gameState
  };
};

// Process player move
const processMove = (gameState: TicTacToeState, moveData: GameMove, sender: nkruntime.Presence, logger: nkruntime.Logger, dispatcher: nkruntime.MatchDispatcher): TicTacToeState => {
  // Validate move
  if (gameState.gameStatus !== 'playing') {
    return gameState;
  }

  if (sender.userId !== gameState.currentPlayer) {
    logger.warn(`Player ${sender.userId} tried to move out of turn`);
    return gameState;
  }

  if (moveData.position < 0 || moveData.position > 8) {
    logger.warn(`Invalid position ${moveData.position}`);
    return gameState;
  }

  if (gameState.board[moveData.position] !== null) {
    logger.warn(`Position ${moveData.position} already occupied`);
    return gameState;
  }

  // Apply move
  const playerSymbol = gameState.players[sender.userId].symbol;
  gameState.board[moveData.position] = playerSymbol;

  // Check for winner
  const winner = checkWinner(gameState.board);
  if (winner) {
    gameState.winner = sender.userId;
    gameState.gameStatus = 'finished';
    
    // Update player stats
    updatePlayerStats(sender.userId, 'win', logger);
    
    // Find and update loser stats
    const loserId = Object.keys(gameState.players).find(id => id !== sender.userId);
    if (loserId) {
      updatePlayerStats(loserId, 'loss', logger);
    }

    dispatcher.broadcastMessage(1, JSON.stringify({
      type: 'gameEnd',
      reason: 'winner',
      winner: sender.userId,
      state: gameState
    }));
    
    return gameState;
  }

  // Check for draw
  if (gameState.board.every(cell => cell !== null)) {
    gameState.isDraw = true;
    gameState.gameStatus = 'finished';
    
    // Update both players' stats for draw
    Object.keys(gameState.players).forEach(playerId => {
      updatePlayerStats(playerId, 'draw', logger);
    });

    dispatcher.broadcastMessage(1, JSON.stringify({
      type: 'gameEnd',
      reason: 'draw',
      state: gameState
    }));
    
    return gameState;
  }

  // Switch turns
  const players = Object.keys(gameState.players);
  gameState.currentPlayer = players.find(id => id !== gameState.currentPlayer) || players[0];
  gameState.turnStartTime = Date.now();

  // Broadcast move and updated game state
  dispatcher.broadcastMessage(1, JSON.stringify({
    type: 'move',
    position: moveData.position,
    symbol: playerSymbol,
    nextPlayer: gameState.currentPlayer,
    state: gameState
  }));

  return gameState;
};

// Check for winner
const checkWinner = (board: (string | null)[]): string | null => {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
};

// Update player statistics
const updatePlayerStats = (userId: string, result: 'win' | 'loss' | 'draw', logger: nkruntime.Logger): void => {
  // This would typically update a leaderboard or player stats storage
  // For now, we'll just log it
  logger.info(`Player ${userId} result: ${result}`);
};

// Match signal handler
const matchSignal: nkruntime.MatchSignalFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, data: string): {state: nkruntime.MatchState, data?: string} | null => {
  logger.info('Received match signal: ' + data);
  
  return {
    state: state
  };
};

// Match termination
const matchTerminate: nkruntime.MatchTerminateFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number): {state: nkruntime.MatchState} | null => {
  logger.info('Match terminated');
  
  return {
    state: state
  };
};

// Matchmaker matched - creates match when players are found
const matchmakerMatched: nkruntime.MatchmakerMatchedFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, entries: nkruntime.MatchmakerEntry[]): string | null => {
  logger.info(`Matchmaker matched ${entries.length} players`);
  
  if (entries.length < 2) {
    return null; // Need at least 2 players
  }

  const matchId = nk.matchCreate(TIC_TAC_TOE_MATCH, {});
  
  return matchId;
};