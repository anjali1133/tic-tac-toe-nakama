// Nakama Runtime TypeScript Definitions

declare namespace nkruntime {
  interface Context {
    env: {[key: string]: string};
    executionMode: string;
    node: string;
    version: string;
    userId: string;
    username: string;
    vars: {[key: string]: string};
    userSessionExp: number;
    sessionId: string;
    clientIp: string;
    clientPort: string;
    lang: string;
  }

  interface Logger {
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
  }

  interface Nakama {
    matchCreate(module: string, params?: {[key: string]: any}): string;
    matchmakerAdd(userIds: string[], query: string, minCount: number, maxCount: number, countMultiple?: number, stringProperties?: {[key: string]: string}, numericProperties?: {[key: string]: number}): string;
    binaryToString(data: Uint8Array): string;
    stringToBinary(data: string): Uint8Array;
  }

  interface Initializer {
    registerRpc(id: string, fn: RpcFunction): void;
    registerMatch(name: string, handlers: MatchHandler): void;
    registerMatchmakerMatched(fn: MatchmakerMatchedFunction): void;
  }

  interface MatchHandler {
    matchInit: MatchInitFunction;
    matchJoinAttempt: MatchJoinAttemptFunction;
    matchJoin: MatchJoinFunction;
    matchLeave: MatchLeaveFunction;
    matchLoop: MatchLoopFunction;
    matchSignal: MatchSignalFunction;
    matchTerminate: MatchTerminateFunction;
  }

  interface MatchState {
    [key: string]: any;
  }

  interface Presence {
    userId: string;
    sessionId: string;
    username: string;
    node: string;
    hidden?: boolean;
    persistence?: boolean;
    status?: string;
  }

  interface MatchMessage {
    sender: Presence;
    opCode: number;
    data: Uint8Array;
    reliable: boolean;
    receiveTime: number;
  }

  interface MatchDispatcher {
    broadcastMessage(opCode: number, data: string | Uint8Array, presences?: Presence[], sender?: Presence, reliable?: boolean): void;
    broadcastMessageDeferred(opCode: number, data: string | Uint8Array, presences?: Presence[], sender?: Presence, reliable?: boolean): void;
    matchKick(presences: Presence[]): void;
    matchLabelUpdate(label: string): void;
  }

  interface MatchmakerEntry {
    ticket: string;
    presence: Presence;
    stringProperties: {[key: string]: string};
    numericProperties: {[key: string]: number};
  }

  type InitModule = (ctx: Context, logger: Logger, nk: Nakama, initializer: Initializer) => void;

  type RpcFunction = (ctx: Context, logger: Logger, nk: Nakama, payload: string) => string;

  type MatchInitFunction = (ctx: Context, logger: Logger, nk: Nakama, params: {[key: string]: string}) => {
    state: MatchState;
    tickRate: number;
    label: string;
  };

  type MatchJoinAttemptFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presence: Presence, metadata: {[key: string]: any}) => {
    state: MatchState;
    accept: boolean;
    rejectMessage?: string;
  } | null;

  type MatchJoinFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presences: Presence[]) => {
    state: MatchState;
  } | null;

  type MatchLeaveFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presences: Presence[]) => {
    state: MatchState;
  } | null;

  type MatchLoopFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, messages: MatchMessage[]) => {
    state: MatchState;
  } | null;

  type MatchSignalFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, data: string) => {
    state: MatchState;
    data?: string;
  } | null;

  type MatchTerminateFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, graceSeconds: number) => {
    state: MatchState;
  } | null;

  type MatchmakerMatchedFunction = (ctx: Context, logger: Logger, nk: Nakama, entries: MatchmakerEntry[]) => string | null;
}