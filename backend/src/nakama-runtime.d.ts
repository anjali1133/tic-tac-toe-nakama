declare namespace nkruntime {
  interface Context {
    env: {[key: string]: string};
    executionMode: string;
    matchId: string;
    matchNode: string;
    matchLabel: string;
    matchTickRate: number;
    node: string;
    queryParams: {[key: string]: string[]};
    sessionId: string;
    userId: string;
    username: string;
    userSessionExp: number;
    vars: {[key: string]: string};
    clientIp: string;
    clientPort: string;
  }

  interface Logger {
    debug(format: string, ...args: any[]): void;
    info(format: string, ...args: any[]): void;
    warn(format: string, ...args: any[]): void;
    error(format: string, ...args: any[]): void;
    fields(fields: {[key: string]: any}): Logger;
    withField(key: string, value: any): Logger;
  }

  interface Nakama {
    accountDeleteId(ctx: Context, userId: string, recorded?: boolean): void;
    accountGetId(ctx: Context, userId: string): Account | null;
    accountUpdateId(ctx: Context, userId: string, metadata?: object, username?: string, timezone?: string, location?: string, langTag?: string, avatarUrl?: string): void;
    authenticate(ctx: Context, id: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateApple(ctx: Context, token: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateCustom(ctx: Context, id: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateDevice(ctx: Context, id: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateEmail(ctx: Context, email: string, password: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateFacebook(ctx: Context, token: string, importFriends?: boolean, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateFacebookInstantGame(ctx: Context, signedPlayerInfo: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateGameCenter(ctx: Context, playerId: string, bundleId: string, timestamp: number, salt: string, signature: string, publicKeyUrl: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateGoogle(ctx: Context, token: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    authenticateSteam(ctx: Context, token: string, username?: string, create?: boolean): {userId: string, username: string, created: boolean};
    leaderboardCreate(ctx: Context, id: string, authoritative: boolean, sortOrder?: string, operator?: string, resetSchedule?: string, metadata?: object): void;
    leaderboardDelete(ctx: Context, id: string): void;
    leaderboardRecordDelete(ctx: Context, id: string, ownerId: string): void;
    leaderboardRecordWrite(ctx: Context, id: string, ownerId: string, username?: string, score?: number, subscore?: number, metadata?: object): LeaderboardRecord;
    leaderboardRecordsList(ctx: Context, id: string, ownerIds?: string[], limit?: number, cursor?: string, overrideExpiry?: number): LeaderboardRecordList;
    leaderboardRecordsListCursorFromRank(ctx: Context, id: string, rank: number, overrideExpiry?: number): string;
    matchCreate(ctx: Context, module: string, params?: {[key: string]: any}): string;
    matchGet(ctx: Context, id: string): Match | null;
    matchList(ctx: Context, limit?: number, authoritative?: boolean, label?: string, minSize?: number, maxSize?: number, query?: string, node?: string): MatchList;
    matchSignal(ctx: Context, id: string, data: string): string;
    notificationSend(ctx: Context, userId: string, subject: string, content: object, code: number, senderId?: string, persistent?: boolean): void;
    notificationsSend(ctx: Context, notifications: NotificationRequest[]): void;
    rpc(ctx: Context, id: string, payload?: string, userId?: string): string;
    storageDelete(ctx: Context, deletes: StorageDeleteRequest[]): void;
    storageList(ctx: Context, userId: string, collection?: string, limit?: number, cursor?: string): StorageObjectList;
    storageRead(ctx: Context, reads: StorageReadRequest[]): StorageObject[];
    storageWrite(ctx: Context, writes: StorageWriteRequest[]): StorageWriteAck[];
    streamClose(ctx: Context, stream: Stream): void;
    streamCount(ctx: Context, stream: Stream): number;
    streamSend(ctx: Context, stream: Stream, data: string, presences?: Presence[], reliable?: boolean): void;
    streamSendRaw(ctx: Context, stream: Stream, msg: Uint8Array, presences?: Presence[], reliable?: boolean): void;
    streamUser(ctx: Context, stream: Stream): Presence[];
    streamUserGet(ctx: Context, userId: string, sessionId: string, stream: Stream): PresenceMeta | null;
    streamUserJoin(ctx: Context, userId: string, sessionId: string, stream: Stream, hidden?: boolean, persistence?: boolean, status?: string): boolean;
    streamUserKick(ctx: Context, userId: string, sessionId: string, stream: Stream): void;
    streamUserLeave(ctx: Context, userId: string, sessionId: string, stream: Stream): void;
    streamUserUpdate(ctx: Context, userId: string, sessionId: string, stream: Stream, hidden?: boolean, persistence?: boolean, status?: string): void;
    walletLedgerList(ctx: Context, userId: string, limit?: number, cursor?: string): WalletLedgerList;
    walletLedgerUpdate(ctx: Context, itemId: string, metadata?: object): WalletLedgerResult;
    walletUpdate(ctx: Context, userId: string, changeset: {[key: string]: number}, metadata?: object, updateLedger?: boolean): WalletUpdateResult;
  }

  interface Initializer {
    registerRpc(id: string, fn: RpcFunction): void;
    registerBeforeRt(id: string, fn: RtBeforeHookFunction): void;
    registerAfterRt(id: string, fn: RtAfterHookFunction): void;
    registerMatchmakerMatched(fn: MatchmakerMatchedFunction): void;
    registerMatch(name: string, handlers: MatchHandler): void;
    registerTournamentEnd(fn: TournamentEndFunction): void;
    registerTournamentReset(fn: TournamentResetFunction): void;
    registerLeaderboardReset(fn: LeaderboardResetFunction): void;
  }

  interface MatchHandler {
    matchInit?: MatchInitFunction;
    matchJoinAttempt?: MatchJoinAttemptFunction;
    matchJoin?: MatchJoinFunction;
    matchLeave?: MatchLeaveFunction;
    matchLoop?: MatchLoopFunction;
    matchTerminate?: MatchTerminateFunction;
    matchSignal?: MatchSignalFunction;
  }

  interface MatchState {
    [key: string]: any;
  }

  interface Presence {
    userId: string;
    sessionId: string;
    username: string;
    node: string;
    reason?: number;
  }

  interface PresenceMeta {
    hidden: boolean;
    persistence: boolean;
    status: string;
  }

  interface MatchData {
    matchId: string;
    presence: Presence;
    opCode: number;
    data: Uint8Array | string;
    reliable: boolean;
    receiveTime: number;
  }

  interface MatchMessage {
    sender?: Presence;
    opCode: number;
    data: string;
    reliable: boolean;
    receiveTime: number;
  }

  interface MatchDispatcher {
    broadcastMessage(opCode: number, data?: Uint8Array | string, presences?: Presence[] | null, sender?: Presence | null, reliable?: boolean): void;
    broadcastMessageDeferred(opCode: number, data?: Uint8Array | string, presences?: Presence[] | null, sender?: Presence | null, reliable?: boolean): void;
    matchKick(presences: Presence[]): void;
    matchLabelUpdate(label: string): void;
  }

  interface Stream {
    mode: number;
    subject: string;
    subcontext: string;
    label: string;
  }

  interface Account {
    user: User;
    wallet: string;
    email: string;
    devices: Device[];
    customId: string;
    verifyTime: number;
    disableTime: number;
  }

  interface User {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    langTag: string;
    location: string;
    timezone: string;
    metadata: string;
    facebookId: string;
    googleId: string;
    gamecenterId: string;
    steamId: string;
    online: boolean;
    edgeCount: number;
    createTime: number;
    updateTime: number;
  }

  interface Device {
    id: string;
  }

  interface LeaderboardRecord {
    leaderboardId: string;
    ownerId: string;
    username: string;
    score: number;
    subscore: number;
    numScore: number;
    metadata: string;
    createTime: number;
    updateTime: number;
    expiryTime?: number;
    rank?: number;
    maxNumScore?: number;
  }

  interface LeaderboardRecordList {
    records?: LeaderboardRecord[];
    ownerRecords?: LeaderboardRecord[];
    nextCursor?: string;
    prevCursor?: string;
    rankCount?: number;
  }

  interface Match {
    matchId: string;
    authoritative: boolean;
    label?: string;
    size: number;
    tickRate: number;
    handlerName: string;
    createTime: number;
    node: string;
  }

  interface MatchList {
    matches?: Match[];
  }

  interface NotificationRequest {
    userId: string;
    subject: string;
    content: object;
    code: number;
    senderId?: string;
    persistent?: boolean;
  }

  interface StorageDeleteRequest {
    collection: string;
    key: string;
    userId?: string;
    version?: string;
  }

  interface StorageReadRequest {
    collection: string;
    key: string;
    userId?: string;
  }

  interface StorageWriteRequest {
    collection: string;
    key: string;
    userId?: string;
    value: string;
    version?: string;
    permissionRead?: number;
    permissionWrite?: number;
  }

  interface StorageObject {
    collection: string;
    key: string;
    userId: string;
    value: string;
    version: string;
    permissionRead: number;
    permissionWrite: number;
    createTime: number;
    updateTime: number;
  }

  interface StorageObjectList {
    objects?: StorageObject[];
    cursor?: string;
  }

  interface StorageWriteAck {
    collection: string;
    key: string;
    userId: string;
    version: string;
  }

  interface WalletLedgerList {
    items?: WalletLedgerItem[];
    cursor?: string;
  }

  interface WalletLedgerItem {
    id: string;
    userId: string;
    createTime: number;
    updateTime: number;
    changeset: string;
    metadata: string;
  }

  interface WalletLedgerResult {
    item: WalletLedgerItem;
  }

  interface WalletUpdateResult {
    userId: string;
    updated: {[key: string]: number};
    previous: {[key: string]: number};
  }

  type RpcFunction = (ctx: Context, logger: Logger, nk: Nakama, payload: string) => string;
  type RtBeforeHookFunction = (ctx: Context, logger: Logger, nk: Nakama, envelope: any) => any;
  type RtAfterHookFunction = (ctx: Context, logger: Logger, nk: Nakama, envelope: any) => void;
  type MatchmakerMatchedFunction = (ctx: Context, logger: Logger, nk: Nakama, entries: any[]) => string | null;
  type MatchInitFunction = (ctx: Context, logger: Logger, nk: Nakama, params: {[key: string]: string}) => {state: MatchState, tickRate: number, label: string};
  type MatchJoinAttemptFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presence: Presence, metadata: {[key: string]: any}) => {state: MatchState, accept: boolean, rejectMessage?: string} | null;
  type MatchJoinFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presences: Presence[]) => {state: MatchState} | null;
  type MatchLeaveFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presences: Presence[]) => {state: MatchState} | null;
  type MatchLoopFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, messages: MatchMessage[]) => {state: MatchState} | null;
  type MatchTerminateFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, graceSeconds: number) => {state: MatchState} | null;
  type MatchSignalFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, data: string) => {state: MatchState, data?: string} | null;
  type TournamentEndFunction = (ctx: Context, logger: Logger, nk: Nakama, tournament: any, end: number, reset: number) => void;
  type TournamentResetFunction = (ctx: Context, logger: Logger, nk: Nakama, tournament: any, end: number, reset: number) => void;
  type LeaderboardResetFunction = (ctx: Context, logger: Logger, nk: Nakama, leaderboard: any, reset: number) => void;
}