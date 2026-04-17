import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { GameUpdateMessage, LeaderboardEntry, PlayerStats } from '../types/game';

function parseRpcJson<T>(payload: string | object | undefined): T {
  if (payload == null || payload === '') {
    return {} as T;
  }
  if (typeof payload === 'string') {
    return JSON.parse(payload) as T;
  }
  return payload as T;
}

function decodeMatchPayload(data: string | Uint8Array): string {
  return typeof data === 'string' ? data : new TextDecoder().decode(data);
}

class NakamaService {
  private client: Client;
  private session: Session | null = null;
  private socket: Socket | null = null;
  private matchId: string | null = null;

  constructor() {
    const serverUrl = import.meta.env.VITE_NAKAMA_SERVER_URL || 'localhost';
    const serverPort = import.meta.env.VITE_NAKAMA_SERVER_PORT || '7350';
    const useSSL = import.meta.env.VITE_NAKAMA_USE_SSL === 'true';

    const serverKey = import.meta.env.VITE_NAKAMA_SERVER_KEY || 'defaultkey';
    this.client = new Client(serverKey, serverUrl, serverPort, useSSL, 30000, true);
  }

  async authenticate(username: string): Promise<Session> {
    try {
      // Try to authenticate with device ID
      const deviceId = this.getOrCreateDeviceId();
      this.session = await this.client.authenticateDevice(deviceId, true, username);
      return this.session;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('nakama_device_id');
    if (!deviceId) {
      deviceId = this.generateUUID();
      localStorage.setItem('nakama_device_id', deviceId);
    }
    return deviceId;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async connectSocket(): Promise<Socket> {
    if (!this.session) {
      throw new Error('Must authenticate before connecting socket');
    }

    this.socket = this.client.createSocket(false, false);
    await this.socket.connect(this.session, true);
    return this.socket;
  }

  async findMatch(): Promise<string> {
    if (!this.client || !this.session) {
      throw new Error('Must authenticate before finding match');
    }

    try {
      const response = await this.client.rpc(this.session, 'find_match', {});
      const data = parseRpcJson<{ matchId?: string }>(response.payload);
      const matchId = typeof data.matchId === 'string' ? data.matchId : null;
      if (!matchId) {
        throw new Error('find_match did not return a matchId');
      }
      this.matchId = matchId;
      return matchId;
    } catch (error) {
      console.error('Error finding match:', error);
      throw error;
    }
  }

  async joinMatch(matchId: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket must be connected before joining match');
    }

    this.matchId = matchId;
    await this.socket.joinMatch(matchId);
  }

  async makeMove(position: number): Promise<void> {
    if (!this.socket || !this.matchId) {
      throw new Error('Must be in a match to make a move');
    }

    const moveData = { position };
    await this.socket.sendMatchState(this.matchId, 1, JSON.stringify(moveData));
  }

  onMatchData(callback: (data: GameUpdateMessage) => void): void {
    if (!this.socket) {
      throw new Error('Socket must be connected');
    }

    this.socket.onmatchdata = (matchData) => {
      try {
        const message = JSON.parse(decodeMatchPayload(matchData.data)) as GameUpdateMessage;
        callback(message);
      } catch (error) {
        console.error('Error parsing match data:', error);
      }
    };
  }

  onMatchPresence(callback: (presences: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket must be connected');
    }

    this.socket.onmatchpresence = (presences) => {
      callback(presences);
    };
  }

  async getPlayerStats(): Promise<PlayerStats> {
    if (!this.client || !this.session) {
      throw new Error('Must authenticate to get stats');
    }

    try {
      // Get stats from storage
      const result = await this.client.readStorageObjects(this.session, {
        object_ids: [{
          collection: 'player_stats',
          key: 'games',
          user_id: this.session.user_id
        }]
      });

      if (result.objects && result.objects.length > 0) {
        const raw = result.objects[0].value;
        return typeof raw === 'string' ? (JSON.parse(raw) as PlayerStats) : (raw as PlayerStats);
      }

      return { played: 0, wins: 0, losses: 0, draws: 0 };
    } catch (error) {
      console.error('Error getting player stats:', error);
      return { played: 0, wins: 0, losses: 0, draws: 0 };
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!this.client || !this.session) {
      throw new Error('Must authenticate to get leaderboard');
    }

    try {
      const response = await this.client.rpc(this.session, 'get_leaderboard', {});
      const data = parseRpcJson<{ leaderboard?: LeaderboardEntry[] }>(response.payload);
      return data.leaderboard ?? [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async updateStats(result: 'win' | 'loss' | 'draw'): Promise<void> {
    if (!this.client || !this.session) {
      throw new Error('Must authenticate to update stats');
    }

    try {
      await this.client.rpc(this.session, 'update_stats', { result });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  leaveMatch(): void {
    if (this.socket && this.matchId) {
      this.socket.leaveMatch(this.matchId);
      this.matchId = null;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect(false);
      this.socket = null;
    }
    this.matchId = null;
  }

  get currentUserId(): string | null {
    return this.session?.user_id || null;
  }

  get username(): string | null {
    return this.session?.username || null;
  }

  get isConnected(): boolean {
    return this.socket !== null;
  }

  get currentMatchId(): string | null {
    return this.matchId;
  }
}

export const nakamaService = new NakamaService();