import { LeaderboardEntry } from '../types/game';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string | null;
  onRefresh: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  leaderboard,
  currentUserId,
  onRefresh
}) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3>Leaderboard</h3>
        <button 
          onClick={onRefresh}
          className="button button-secondary"
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          Refresh
        </button>
      </div>
      
      {leaderboard.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No players on leaderboard yet
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.slice(0, 10).map((entry) => (
            <div 
              key={entry.userId}
              className="leaderboard-item"
              style={{
                fontWeight: entry.userId === currentUserId ? '700' : 'normal',
                background: entry.userId === currentUserId ? '#e6f3ff' : 'white'
              }}
            >
              <div className="leaderboard-rank">#{entry.rank}</div>
              <div className="leaderboard-username">
                {entry.username}
                {entry.userId === currentUserId && ' (You)'}
              </div>
              <div className="leaderboard-wins">{entry.wins} wins</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};