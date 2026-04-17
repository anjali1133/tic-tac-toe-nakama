import { useState, useEffect, useCallback } from 'react';
import { GameState, GameUpdateMessage, Player, PlayerStats, LeaderboardEntry } from '../types/game';
import { nakamaService } from '../services/nakama';
import toast from 'react-hot-toast';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInMatch, setIsInMatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    // Setup match data listener
    if (isConnected) {
      nakamaService.onMatchData((message: GameUpdateMessage) => {
        if (message.type === 'game_update') {
          setGameState(message.data);
          
          // Find current player
          const userId = nakamaService.currentUserId;
          if (userId && message.data.players[userId]) {
            setCurrentPlayer(message.data.players[userId]);
          }

          // Show game result notifications
          if (message.data.gameStatus === 'finished' && message.data.winner) {
            if (message.data.winner === 'draw') {
              toast('Game ended in a draw!', { icon: '🤝' });
            } else if (currentPlayer && message.data.winner === currentPlayer.symbol) {
              toast.success('You won! 🎉');
            } else {
              toast.error('You lost! Better luck next time.');
            }

            // Update stats after game ends
            if (currentPlayer) {
              let result: 'win' | 'loss' | 'draw' = 'draw';
              if (message.data.winner !== 'draw') {
                result = message.data.winner === currentPlayer.symbol ? 'win' : 'loss';
              }
              nakamaService.updateStats(result);
              loadPlayerStats();
            }
          }

          // Handle timeout
          if (message.data.reason === 'timeout') {
            toast.error('Game ended due to timeout');
          }
        }
      });

      nakamaService.onMatchPresence((presences) => {
        console.log('Match presence update:', presences);
      });
    }
  }, [isConnected, currentPlayer]);

  const authenticate = useCallback(async (username: string) => {
    setIsLoading(true);
    try {
      await nakamaService.authenticate(username);
      setIsAuthenticated(true);
      toast.success(`Welcome, ${username}!`);
      loadPlayerStats();
      loadLeaderboard();
    } catch (error) {
      toast.error('Authentication failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectSocket = useCallback(async () => {
    setIsLoading(true);
    try {
      await nakamaService.connectSocket();
      setIsConnected(true);
      toast.success('Connected to server');
    } catch (error) {
      toast.error('Failed to connect to server');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findMatch = useCallback(async () => {
    setIsLoading(true);
    try {
      const matchId = await nakamaService.findMatch();
      await nakamaService.joinMatch(matchId);
      setIsInMatch(true);
      toast.success('Match found!');
    } catch (error) {
      toast.error('Failed to find match');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const makeMove = useCallback(async (position: number) => {
    try {
      await nakamaService.makeMove(position);
    } catch (error) {
      toast.error('Failed to make move');
      console.error('Move error:', error);
    }
  }, []);

  const leaveMatch = useCallback(() => {
    nakamaService.leaveMatch();
    setIsInMatch(false);
    setGameState(null);
    setCurrentPlayer(null);
    toast('Left the match');
  }, []);

  const disconnect = useCallback(() => {
    nakamaService.disconnect();
    setIsConnected(false);
    setIsInMatch(false);
    setGameState(null);
    setCurrentPlayer(null);
    toast('Disconnected from server');
  }, []);

  const loadPlayerStats = useCallback(async () => {
    try {
      const stats = await nakamaService.getPlayerStats();
      setPlayerStats(stats);
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const leaderboard = await nakamaService.getLeaderboard();
      setLeaderboard(leaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }, []);

  const canMakeMove = useCallback((position: number): boolean => {
    if (!gameState || !currentPlayer) return false;
    if (gameState.gameStatus !== 'playing') return false;
    if (gameState.currentPlayer !== currentPlayer.symbol) return false;
    if (gameState.board[position] !== '') return false;
    return true;
  }, [gameState, currentPlayer]);

  const isMyTurn = useCallback((): boolean => {
    if (!gameState || !currentPlayer) return false;
    return gameState.currentPlayer === currentPlayer.symbol && gameState.gameStatus === 'playing';
  }, [gameState, currentPlayer]);

  return {
    // State
    gameState,
    isConnected,
    isAuthenticated,
    isInMatch,
    isLoading,
    playerStats,
    leaderboard,
    currentPlayer,

    // Actions
    authenticate,
    connectSocket,
    findMatch,
    makeMove,
    leaveMatch,
    disconnect,
    loadPlayerStats,
    loadLeaderboard,

    // Computed
    canMakeMove,
    isMyTurn
  };
};