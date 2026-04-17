import { PlayerStats } from '../types/game';

interface PlayerStatsProps {
  stats: PlayerStats | null;
  onRefresh: () => void;
}

export const PlayerStatsComponent: React.FC<PlayerStatsProps> = ({
  stats,
  onRefresh
}) => {
  if (!stats) {
    return (
      <div className="card">
        <h3>Your Statistics</h3>
        <div style={{ textAlign: 'center', color: '#666' }}>
          Loading stats...
        </div>
      </div>
    );
  }

  const winRate = stats.played > 0 ? ((stats.wins / stats.played) * 100).toFixed(1) : '0.0';

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3>Your Statistics</h3>
        <button 
          onClick={onRefresh}
          className="button button-secondary"
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          Refresh
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.played}</div>
          <div className="stat-label">Games Played</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{stats.wins}</div>
          <div className="stat-label">Wins</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{stats.losses}</div>
          <div className="stat-label">Losses</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{stats.draws}</div>
          <div className="stat-label">Draws</div>
        </div>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '15px', 
        padding: '10px', 
        background: 'white', 
        borderRadius: '8px' 
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#667eea' }}>
          {winRate}%
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Win Rate
        </div>
      </div>
    </div>
  );
};