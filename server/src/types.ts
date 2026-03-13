export type Role = 'admin' | 'player' | 'spectator';
export type GamePhase = 'lobby' | 'playing' | 'expert-comment' | 'final';
export type PlayerStatus = 'waiting' | 'submitted' | 'decided' | 'comment' | 'next';
export type SpectatorMode = 'track' | 'ranking' | 'focus' | 'comment' | 'final';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  business?: string;
  speed: number;
  position: number;
  status: PlayerStatus;
  connected: boolean;
  answers: Record<number, unknown>;
  lastSpeedDelta?: Record<number, 10 | -10>;
}

export interface TimerState {
  running: boolean;
  remaining: number;
  total: number;
}

export interface Room {
  id: string;
  code: string;
  adminSocketId: string;
  players: Player[];
  spectatorSocketIds: Set<string>;
  phase: GamePhase;
  currentStage: number;
  timer: TimerState;
  timerInterval: ReturnType<typeof setInterval> | null;
  spectatorMode: SpectatorMode;
  focusPlayerId?: string;
  adminComment: string;
}

export interface RoomStateDTO {
  id: string;
  code: string;
  adminId: string;
  players: Player[];
  phase: GamePhase;
  currentStage: number;
  timer: TimerState;
  spectatorMode: SpectatorMode;
  focusPlayerId?: string;
  adminComment: string;
}

export const INITIAL_SPEED = 60;
export const MAX_PLAYERS = 6;
export const SPEED_DELTA = 10;

export const STAGE_TIMERS = [60, 60, 180, 60, 120, 60];
