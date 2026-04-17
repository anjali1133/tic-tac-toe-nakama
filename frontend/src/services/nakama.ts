import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { v4 as uuidv4 } from 'uuid';

export class NakamaService {
  private client: Client;
  private socket: Socket | null = null;
  private session: Session | null = null;
  
  constructor() {
    const host = process.env.REACT_APP_NAKAMA_HOST || 'localhost';
    const port = process.env.REACT_APP_NAKAMA_PORT || '7350';
    const useSSL = process.env.REACT_APP_NAKAMA_USE_SSL === 'true';
    
    this.client = new Client('defaultkey', host, port, useSSL);
  }

  async connect(): Promise<void> {
    try {
      // Create a device ID for anonymous authentication
      const deviceId = this.getOrCreateDeviceId();
      
      // Authenticate with device ID
      this.session = await this.client.authenticateDevice(deviceId, true);
      
      // Create socket connection
      this.socket = this.client.createSocket(true, false);
      await this.socket.connect(this.session, true);
      
      console.log('Connected to Nakama server');
    } catch (error) {
      console.error('Failed to connect to Nakama:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect(true);
      this.socket = null;
    }
    this.session = null;
  }

  async createGame(): Promise<string> {
    if (!this.session) {
      throw new Error('Not connected to server');
    }

    const response = await this.client.rpc(this.session, 'create_game', {});
    const result = JSON.parse((response.payload as any));
    return result.matchId;
  }

  async joinMatchmaking(): Promise<string> {
    if (!this.session) {
      throw new Error('Not connected to server');
    }

    const response = await this.client.rpc(this.session, 'join_matchmaking', {});
    const result = JSON.parse((response.payload as any));
    return result.ticket;
  }

  async joinMatch(matchId: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    await this.socket.joinMatch(matchId);
  }

  async leaveMatch(matchId: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    await this.socket.leaveMatch(matchId);
  }

  async sendMove(matchId: string, position: number): Promise<void> {
    if (!this.socket || !this.session) {
      throw new Error('Not connected to server');
    }

    const moveData = {
      position: position,
      playerId: this.session.user_id
    };

    await this.socket.sendMatchState(matchId, 1, JSON.stringify(moveData));
  }

  onMatchData(callback: (matchId: string, data: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.onmatchdata = (result) => {
      const data = JSON.parse(new TextDecoder().decode(result.data));
      callback(result.match_id, data);
    };
  }

  onMatchPresence(callback: (matchId: string, joins: any[], leaves: any[]) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.onmatchpresence = (result) => {
      callback(result.match_id, result.joins, result.leaves);
    };
  }

  onMatchmakerMatched(callback: (matched: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.onmatchmakermatched = callback;
  }

  onDisconnect(callback: () => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.ondisconnect = callback;
  }

  onError(callback: (error: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.onerror = callback;
  }

  getCurrentUser() {
    return this.session?.user_id || null;
  }

  getCurrentUsername() {
    return this.session?.username || 'Anonymous';
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('nakama_device_id');
    
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('nakama_device_id', deviceId);
    }
    
    return deviceId;
  }

  isConnected(): boolean {
    return !!this.socket && !!this.session;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getSession(): Session | null {
    return this.session;
  }
}

export const nakamaService = new NakamaService();