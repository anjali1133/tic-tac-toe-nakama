import { Player } from '../types/game';

interface PlayerListProps {
  players: { [key: string]: Player };
  currentTurn: 'X' | 'O';
  currentUserId: string | null;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentTurn,
  currentUserId
}) => {
  const playerArray = Object.values(players);

  return (
    <div className="card">
      <h3>Players</h3>
      <div className="players-list">
        {playerArray.map((player) => (
          <div
            key={player.userId}
            className={`player-item ${
              currentTurn === player.symbol ? 'current-turn' : ''
            }`}
          >
            <div className="player-info">
              <div className={`player-symbol ${player.symbol.toLowerCase()}`}>
                {player.symbol}
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>
                  {player.username}
                  {player.userId === currentUserId && ' (You)'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {player.connected ? 'Online' : 'Disconnected'}
                </div>
              </div>
            </div>
            <div 
              className={`connection-status ${
                player.connected ? '' : 'disconnected'
              }`}
            />
          </div>
        ))}
        
        {playerArray.length < 2 && (
          <div className="player-item">
            <div className="player-info">
              <div className="player-symbol" style={{ background: '#f0f0f0', color: '#999' }}>
                ?
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#999' }}>
                  Waiting for player...
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Game will start when someone joins
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};