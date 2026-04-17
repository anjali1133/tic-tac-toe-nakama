import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameMessage, ConnectionState } from '../types/game';
import { nakamaService } from '../services/nakama';

interface GameContextType {
  gameState: GameState | null;
  connectionState: ConnectionState;
  currentMatchId: string | null;
  isPlayerTurn: boolean;
  dispatch: React.Dispatch<GameAction>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  createGame: () => Promise<void>;
  joinMatchmaking: () => Promise<void>;
  makeMove: (position: number) => Promise<void>;
  leaveGame: () => Promise<void>;
}

type GameAction =
  | { type: 'SET_CONNECTION_STATE'; payload: Partial<ConnectionState> }
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_MATCH_ID'; payload: string | null }
  | { type: 'RESET_GAME' };

interface GameContextState {
  gameState: GameState | null;
  connectionState: ConnectionState;
  currentMatchId: string | null;
}

const initialState: GameContextState = {
  gameState: null,
  connectionState: {
    connected: false,
    connecting: false,
    error: null
  },
  currentMatchId: null
};

const GameContext = createContext<GameContextType | undefined>(undefined);

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        connectionState: { ...state.connectionState, ...action.payload }
      };
    case 'SET_GAME_STATE':
      return {
        ...state,
        gameState: action.payload
      };
    case 'SET_MATCH_ID':
      return {
        ...state,
        currentMatchId: action.payload
      };
    case 'RESET_GAME':
      return {
        ...state,
        gameState: null,
        currentMatchId: null
      };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const connect = async () => {
    dispatch({ type: 'SET_CONNECTION_STATE', payload: { connecting: true, error: null } });
    
    try {
      await nakamaService.connect();
      dispatch({ type: 'SET_CONNECTION_STATE', payload: { connected: true, connecting: false } });
      
      // Set up event listeners
      setupEventListeners();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      dispatch({ 
        type: 'SET_CONNECTION_STATE', 
        payload: { connected: false, connecting: false, error: errorMessage } 
      });
      throw error;
    }
  };

  const disconnect = async () => {
    await nakamaService.disconnect();
    dispatch({ type: 'SET_CONNECTION_STATE', payload: { connected: false, connecting: false, error: null } });
    dispatch({ type: 'RESET_GAME' });
  };

  const createGame = async () => {
    try {
      const matchId = await nakamaService.createGame();
      await nakamaService.joinMatch(matchId);
      dispatch({ type: 'SET_MATCH_ID', payload: matchId });
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  };

  const joinMatchmaking = async () => {
    try {
      await nakamaService.joinMatchmaking();
      // The matchmaker will automatically join us to a match when found
    } catch (error) {
      console.error('Failed to join matchmaking:', error);
      throw error;
    }
  };

  const makeMove = async (position: number) => {
    if (!state.currentMatchId) {
      throw new Error('No active match');
    }
    
    try {
      await nakamaService.sendMove(state.currentMatchId, position);
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  };

  const leaveGame = async () => {
    if (state.currentMatchId) {
      try {
        await nakamaService.leaveMatch(state.currentMatchId);
        dispatch({ type: 'RESET_GAME' });
      } catch (error) {
        console.error('Failed to leave game:', error);
      }
    }
  };

  const setupEventListeners = () => {
    // Handle match data (game state updates, moves, etc.)
    nakamaService.onMatchData((matchId: string, data: GameMessage) => {
      console.log('Received match data:', data);
      
      if (data.type === 'gameState' && data.state) {
        dispatch({ type: 'SET_GAME_STATE', payload: data.state });
      } else if (data.type === 'move' && data.state) {
        dispatch({ type: 'SET_GAME_STATE', payload: data.state });
      } else if (data.type === 'gameEnd' && data.state) {
        dispatch({ type: 'SET_GAME_STATE', payload: data.state });
      }
    });

    // Handle player joins/leaves
    nakamaService.onMatchPresence((matchId: string, joins: any[], leaves: any[]) => {
      console.log('Match presence update:', { joins, leaves });
      // Could update UI to show joining/leaving players
    });

    // Handle matchmaker success
    nakamaService.onMatchmakerMatched(async (matched: any) => {
      console.log('Matchmaker found match:', matched);
      
      try {
        await nakamaService.joinMatch(matched.match_id);
        dispatch({ type: 'SET_MATCH_ID', payload: matched.match_id });
      } catch (error) {
        console.error('Failed to join matched game:', error);
      }
    });

    // Handle disconnection
    nakamaService.onDisconnect(() => {
      dispatch({ type: 'SET_CONNECTION_STATE', payload: { connected: false, error: 'Disconnected from server' } });
    });

    // Handle errors
    nakamaService.onError((error: any) => {
      console.error('Socket error:', error);
      dispatch({ type: 'SET_CONNECTION_STATE', payload: { error: 'Connection error occurred' } });
    });
  };

  const isPlayerTurn = React.useMemo(() => {
    if (!state.gameState || !nakamaService.getCurrentUser()) {
      return false;
    }
    
    return state.gameState.currentPlayer === nakamaService.getCurrentUser() && 
           state.gameState.gameStatus === 'playing';
  }, [state.gameState]);

  // Auto-connect on mount
  useEffect(() => {
    connect().catch(console.error);
    
    // Cleanup on unmount
    return () => {
      disconnect().catch(console.error);
    };
  }, []);

  const contextValue: GameContextType = {
    gameState: state.gameState,
    connectionState: state.connectionState,
    currentMatchId: state.currentMatchId,
    isPlayerTurn,
    dispatch,
    connect,
    disconnect,
    createGame,
    joinMatchmaking,
    makeMove,
    leaveGame
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}