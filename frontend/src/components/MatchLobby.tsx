interface MatchLobbyProps {
  onFindMatch: () => void;
  onDisconnect: () => void;
  isLoading: boolean;
  username: string | null;
}

export const MatchLobby: React.FC<MatchLobbyProps> = ({
  onFindMatch,
  onDisconnect,
  isLoading,
  username
}) => {
  return (
    <div className="loading">
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.8rem' }}>
          Welcome, {username}!
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Ready to play? Find a match to start playing against other players.
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={onFindMatch}
          className="button button-primary"
          disabled={isLoading}
          style={{ minWidth: '200px' }}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent' }} />
              Finding Match...
            </>
          ) : (
            'Find Match'
          )}
        </button>
        
        <button
          onClick={onDisconnect}
          className="button button-secondary"
          disabled={isLoading}
        >
          Disconnect
        </button>
      </div>
      
      <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', maxWidth: '400px' }}>
        <p><strong>Matchmaking:</strong></p>
        <p>• You'll be paired with another player</p>
        <p>• Games are server-authoritative (no cheating!)</p>
        <p>• Real-time multiplayer with WebSocket</p>
        <p>• Stats and leaderboard tracking</p>
      </div>
    </div>
  );
};