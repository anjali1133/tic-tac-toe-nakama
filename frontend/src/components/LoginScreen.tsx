import { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
  isLoading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-screen">
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.8rem' }}>
          Welcome to Multiplayer Tic-Tac-Toe
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Enter your username to start playing against other players online
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input"
          disabled={isLoading}
          maxLength={20}
          required
        />
        
        <button
          type="submit"
          className="button button-primary"
          disabled={!username.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent' }} />
              Connecting...
            </>
          ) : (
            'Start Playing'
          )}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', maxWidth: '400px' }}>
        <p><strong>How to play:</strong></p>
        <p>• Connect with other players in real-time</p>
        <p>• Take turns placing X's and O's</p>
        <p>• First to get 3 in a row wins!</p>
        <p>• 30 seconds per move</p>
      </div>
    </div>
  );
};