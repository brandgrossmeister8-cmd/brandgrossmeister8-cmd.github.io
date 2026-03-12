export type Role = 'admin' | 'player' | 'spectator';

export type GamePhase = 'title' | 'rules' | 'lobby' | 'playing' | 'expert-comment' | 'final';

export type PlayerStatus = 'waiting' | 'submitted' | 'decided' | 'comment' | 'next';

export type SpectatorMode = 'track' | 'ranking' | 'focus' | 'comment' | 'final';

export type SpeedDelta = 10 | -10;

export interface Player {
  id: string;
  name: string;
  speed: number;
  position: number;
  status: PlayerStatus;
  connected: boolean;
  answers: Record<number, unknown>;
  adminPlayerComment?: string;
}

export interface TimerState {
  running: boolean;
  remaining: number;
  total: number;
}

export interface RoomState {
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

export interface StageAnswer {
  stageIndex: number;
  answer: unknown;
}

export type AnswerType = 'single-choice' | 'slider' | 'textarea' | 'choice-then-cards';

export interface StageCardOption {
  id: string;
  label: string;
  editable?: boolean;
  placeholder?: string;
}

export interface StageConfig {
  index: number;
  title: string;
  cityName: string;
  timerSeconds: number;
  question: string;
  answerType: AnswerType;
  options?: StageCardOption[];
  sliderLabels?: [string, string];
  subChoices?: Record<string, StageCardOption[]>;
  subChoiceHints?: Record<string, string>;
  placeholder?: string;
}

export interface SpeedInterpretation {
  speed: number;
  text: string;
}
