// Nakama Runtime TypeScript Entry Point

// Game state interfaces
interface GameState {
    board: string[]; // 9 positions: 'X', 'O', or ''
    currentPlayer: string; // 'X' or 'O'
    gameStatus: 'waiting' | 'playing' | 'finished';
    winner: string | null; // 'X', 'O', 'draw', or null
    players: { [key: string]: Player };
    lastMoveTime: number;
    moveTimer: number; // 30 seconds per move
}

interface Player {
    userId: string;
    username: string;
    symbol: string; // 'X' or 'O'
    connected: boolean;
}

interface MoveMessage {
    position: number; // 0-8
}

interface JoinMatchMessage {
    username?: string;
}

const MOVE_TIMEOUT = 30000; // 30 seconds
const MATCH_LABEL = "tic-tac-toe";

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    logger.info('Tic-Tac-Toe module loaded');

    // Initialize leaderboards
    initializeLeaderboards(ctx, logger, nk);

    // Register match handler
    initializer.registerMatch(MATCH_LABEL, {
        matchInit,
        matchJoinAttempt,
        matchJoin,
        matchLeave,
        matchLoop,
        matchSignal,
        matchTerminate
    });

    // Register RPC for matchmaking
    initializer.registerRpc("find_match", findMatch);
    initializer.registerRpc("get_leaderboard", getLeaderboard);
    initializer.registerRpc("update_stats", updateStats);

    logger.info('All handlers registered');
}

// Match initialization
function matchInit(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}): {state: nkruntime.MatchState, tickRate: number, label: string} {
    logger.info('Match initialized');
    
    const gameState: GameState = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameStatus: 'waiting',
        winner: null,
        players: {},
        lastMoveTime: Date.now(),
        moveTimer: MOVE_TIMEOUT
    };

    return {
        state: gameState,
        tickRate: 1, // 1 tick per second
        label: MATCH_LABEL
    };
}

// Check if player can join
function matchJoinAttempt(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: {[key: string]: any}): {state: nkruntime.MatchState, accept: boolean, rejectMessage?: string} | null {
    logger.info('Join attempt from user: ' + presence.userId);
    
    const gameState = state as GameState;
    const playerCount = Object.keys(gameState.players).length;

    if (playerCount >= 2) {
        return {
            state: gameState,
            accept: false,
            rejectMessage: "Match is full"
        };
    }

    return {
        state: gameState,
        accept: true
    };
}

// Handle player joining
function matchJoin(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): {state: nkruntime.MatchState} | null {
    const gameState = state as GameState;
    
    presences.forEach(presence => {
        logger.info('Player joined: ' + presence.userId);
        
        // Assign player symbol (X or O)
        const playerCount = Object.keys(gameState.players).length;
        const symbol = playerCount === 0 ? 'X' : 'O';
        
        gameState.players[presence.userId] = {
            userId: presence.userId,
            username: presence.username,
            symbol: symbol,
            connected: true
        };

        // Start game if we have 2 players
        if (Object.keys(gameState.players).length === 2) {
            gameState.gameStatus = 'playing';
            gameState.lastMoveTime = Date.now();
        }
    });

    // Broadcast updated state to all players
    const message = {
        type: 'game_update',
        data: {
            board: gameState.board,
            currentPlayer: gameState.currentPlayer,
            gameStatus: gameState.gameStatus,
            players: gameState.players,
            winner: gameState.winner,
            moveTimer: gameState.moveTimer
        }
    };
    dispatcher.broadcastMessage(1, JSON.stringify(message), null, null, true);

    return { state: gameState };
}

// Handle player leaving
function matchLeave(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): {state: nkruntime.MatchState} | null {
    const gameState = state as GameState;
    
    presences.forEach(presence => {
        logger.info('Player left: ' + presence.userId);
        
        if (gameState.players[presence.userId]) {
            gameState.players[presence.userId].connected = false;
            
            // End game if player leaves during active game
            if (gameState.gameStatus === 'playing') {
                const remainingPlayer = Object.values(gameState.players).find(p => p.connected);
                if (remainingPlayer) {
                    gameState.winner = remainingPlayer.symbol;
                    gameState.gameStatus = 'finished';
                }
            }
        }
    });

    // Broadcast updated state
    const message = {
        type: 'game_update',
        data: {
            board: gameState.board,
            currentPlayer: gameState.currentPlayer,
            gameStatus: gameState.gameStatus,
            players: gameState.players,
            winner: gameState.winner,
            moveTimer: gameState.moveTimer
        }
    };
    dispatcher.broadcastMessage(1, JSON.stringify(message), null, null, true);

    return { state: gameState };
}

// Main game loop
function matchLoop(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]): {state: nkruntime.MatchState} | null {
    const gameState = state as GameState;
    
    // Handle move timeout
    if (gameState.gameStatus === 'playing') {
        const timePassed = Date.now() - gameState.lastMoveTime;
        if (timePassed > MOVE_TIMEOUT) {
            // Current player loses due to timeout
            const otherPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
            gameState.winner = otherPlayer;
            gameState.gameStatus = 'finished';
            
            const message = {
                type: 'game_update',
                data: {
                    board: gameState.board,
                    currentPlayer: gameState.currentPlayer,
                    gameStatus: gameState.gameStatus,
                    players: gameState.players,
                    winner: gameState.winner,
                    moveTimer: 0,
                    reason: 'timeout'
                }
            };
            dispatcher.broadcastMessage(1, JSON.stringify(message), null, null, true);
        } else {
            gameState.moveTimer = MOVE_TIMEOUT - timePassed;
        }
    }

    // Process player moves
    messages.forEach(message => {
        if (message.opCode === 1) { // Move message
            try {
                const moveData: MoveMessage = JSON.parse(message.data);
                const playerId = message.sender?.userId;
                
                if (playerId && gameState.players[playerId]) {
                    processMove(gameState, playerId, moveData.position, dispatcher, logger);
                }
            } catch (error) {
                logger.error('Error processing move: ' + error);
            }
        }
    });

    return { state: gameState };
}

// Process player move with server-side validation
function processMove(gameState: GameState, playerId: string, position: number, dispatcher: nkruntime.MatchDispatcher, logger: nkruntime.Logger) {
    // Validate move
    if (gameState.gameStatus !== 'playing') {
        logger.warn('Move attempted but game not in playing state');
        return;
    }

    const player = gameState.players[playerId];
    if (!player) {
        logger.warn('Move attempted by non-existent player');
        return;
    }

    if (player.symbol !== gameState.currentPlayer) {
        logger.warn('Move attempted by wrong player');
        return;
    }

    if (position < 0 || position > 8) {
        logger.warn('Invalid position: ' + position);
        return;
    }

    if (gameState.board[position] !== '') {
        logger.warn('Position already occupied: ' + position);
        return;
    }

    // Apply move
    gameState.board[position] = player.symbol;
    gameState.lastMoveTime = Date.now();

    // Check for win or draw
    const winner = checkWinner(gameState.board);
    if (winner) {
        gameState.winner = winner;
        gameState.gameStatus = 'finished';
        
        // Update player stats
        updatePlayerStats(playerId, winner === player.symbol ? 'win' : 'loss', dispatcher);
        const otherPlayerId = Object.keys(gameState.players).find(id => id !== playerId);
        if (otherPlayerId) {
            updatePlayerStats(otherPlayerId, winner === gameState.players[otherPlayerId].symbol ? 'win' : 'loss', dispatcher);
        }
    } else if (gameState.board.every(cell => cell !== '')) {
        // Draw
        gameState.winner = 'draw';
        gameState.gameStatus = 'finished';
        
        // Update stats for both players
        Object.keys(gameState.players).forEach(pid => {
            updatePlayerStats(pid, 'draw', dispatcher);
        });
    } else {
        // Switch turns
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    }

    // Broadcast game state update
    const message = {
        type: 'game_update',
        data: {
            board: gameState.board,
            currentPlayer: gameState.currentPlayer,
            gameStatus: gameState.gameStatus,
            players: gameState.players,
            winner: gameState.winner,
            moveTimer: gameState.moveTimer,
            lastMove: { position, player: player.symbol }
        }
    };
    dispatcher.broadcastMessage(1, JSON.stringify(message), null, null, true);
}

// Check for winning condition
function checkWinner(board: string[]): string | null {
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
}

// Update player statistics
function updatePlayerStats(playerId: string, result: 'win' | 'loss' | 'draw', dispatcher: nkruntime.MatchDispatcher) {
    const message = {
        type: 'update_stats',
        data: { playerId, result }
    };
    dispatcher.broadcastMessage(2, JSON.stringify(message), null, null, true);
}

// Handle match signals
function matchSignal(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, data: string): {state: nkruntime.MatchState, data?: string} | null {
    logger.info('Match signal received: ' + data);
    return { state: state };
}

// Handle match termination
function matchTerminate(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number): {state: nkruntime.MatchState} | null {
    logger.info('Match terminating');
    return { state: state };
}

// RPC: Find or create a match
function findMatch(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('Finding match for user: ' + ctx.userId);
    
    // List existing matches
    const matchList = nk.matchList(ctx, 10, true, MATCH_LABEL, undefined, undefined, undefined, undefined);
    
    // Look for a match with only 1 player
    if (matchList.matches) {
        for (const match of matchList.matches) {
            if (match.size < 2) {
                logger.info('Found existing match: ' + match.matchId);
                return JSON.stringify({ matchId: match.matchId });
            }
        }
    }

    // Create new match
    const matchId = nk.matchCreate(ctx, MATCH_LABEL, {});
    logger.info('Created new match: ' + matchId);
    
    return JSON.stringify({ matchId });
}

// RPC: Get leaderboard
function getLeaderboard(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    try {
        const records = nk.leaderboardRecordsList(ctx, "tic_tac_toe_wins", undefined, 100, undefined, undefined);
        
        const leaderboard = records.records?.map(record => ({
            userId: record.ownerId,
            username: record.username,
            wins: record.score,
            rank: record.rank
        })) || [];

        return JSON.stringify({ leaderboard });
    } catch (error) {
        logger.error('Error getting leaderboard: ' + (error as Error).message);
        return JSON.stringify({ leaderboard: [] });
    }
}

// RPC: Update player statistics
function updateStats(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    try {
        const data = JSON.parse(payload);
        const { result } = data;
        
        // Update wins leaderboard
        if (result === 'win') {
            nk.leaderboardRecordWrite(ctx, "tic_tac_toe_wins", ctx.userId, ctx.username, 1, undefined, undefined);
        }
        
        // Update games played storage
        let gamesData = { played: 0, wins: 0, losses: 0, draws: 0 };
        try {
            const storageRead = nk.storageRead(ctx, [{
                collection: "player_stats",
                key: "games",
                userId: ctx.userId
            }]);
            
            if (storageRead.length > 0) {
                gamesData = JSON.parse(storageRead[0].value);
            }
        } catch (e) {
            logger.info('No existing stats for user: ' + ctx.userId);
        }

        gamesData.played++;
        if (result === 'win') gamesData.wins++;
        else if (result === 'loss') gamesData.losses++;
        else if (result === 'draw') gamesData.draws++;

        nk.storageWrite(ctx, [{
            collection: "player_stats",
            key: "games",
            userId: ctx.userId,
            value: JSON.stringify(gamesData),
            permissionRead: 2, // Public read
            permissionWrite: 1 // Owner write
        }]);

        return JSON.stringify({ success: true, stats: gamesData });
    } catch (error) {
        logger.error('Error updating stats: ' + (error as Error).message);
        return JSON.stringify({ success: false, error: (error as Error).message });
    }
}

// Initialize leaderboards
function initializeLeaderboards(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama) {
    try {
        nk.leaderboardCreate(ctx, "tic_tac_toe_wins", false, "desc", "best", undefined, {});
        logger.info('Leaderboard created successfully');
    } catch (error) {
        logger.info('Leaderboard already exists or error creating: ' + (error as Error).message);
    }
}