import { Room, RoomStateDTO, Player, INITIAL_SPEED, MAX_PLAYERS, STAGE_TIMERS } from './types.js';

const rooms = new Map<string, Room>();

function generateCode(): string {
  let code: string;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (rooms.has(code));
  return code;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

export function toDTO(room: Room): RoomStateDTO {
  return {
    id: room.id,
    code: room.code,
    adminId: room.adminSocketId,
    players: room.players,
    phase: room.phase,
    currentStage: room.currentStage,
    timer: room.timer,
    spectatorMode: room.spectatorMode,
    focusPlayerId: room.focusPlayerId,
    adminComment: room.adminComment,
  };
}

export function createRoom(adminSocketId: string): Room {
  const code = generateCode();
  const room: Room = {
    id: generateId(),
    code,
    adminSocketId,
    players: [],
    spectatorSocketIds: new Set(),
    phase: 'lobby',
    currentStage: -1,
    timer: { running: false, remaining: 0, total: 0 },
    timerInterval: null,
    spectatorMode: 'track',
    adminComment: '',
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.adminSocketId === socketId) return room;
    if (room.players.some(p => p.socketId === socketId)) return room;
    if (room.spectatorSocketIds.has(socketId)) return room;
  }
  return undefined;
}

export function addPlayer(room: Room, socketId: string, name: string, business?: string): Player | null {
  if (room.players.length >= MAX_PLAYERS) return null;
  if (room.phase !== 'lobby') {
    // Allow reconnect
    const existing = room.players.find(p => p.name === name && !p.connected);
    if (existing) {
      existing.socketId = socketId;
      existing.connected = true;
      return existing;
    }
    return null;
  }
  const player: Player = {
    id: generateId(),
    socketId,
    name: name.substring(0, 20),
    business: business ? business.substring(0, 50) : undefined,
    speed: INITIAL_SPEED,
    position: room.players.length + 1,
    status: 'waiting',
    connected: true,
    answers: {},
  };
  room.players.push(player);
  return player;
}

export function removePlayer(room: Room, socketId: string): Player | undefined {
  const player = room.players.find(p => p.socketId === socketId);
  if (player) {
    player.connected = false;
  }
  return player;
}

export function recalcPositions(room: Room) {
  const sorted = [...room.players].sort((a, b) => b.speed - a.speed);
  sorted.forEach((p, i) => {
    const player = room.players.find(pl => pl.id === p.id);
    if (player) player.position = i + 1;
  });
}

export function adjustSpeed(room: Room, playerId: string, delta: 10 | -10, stageIndex: number): boolean {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return false;
  player.speed = Math.max(0, player.speed + delta);
  player.status = 'decided';
  player.lastSpeedDelta = { ...(player.lastSpeedDelta || {}), [stageIndex]: delta };
  recalcPositions(room);
  return true;
}

export function startStage(room: Room, stageIndex: number) {
  if (stageIndex < 0 || stageIndex >= STAGE_TIMERS.length) return;
  room.currentStage = stageIndex;
  room.phase = 'playing';
  room.timer = { running: false, remaining: STAGE_TIMERS[stageIndex], total: STAGE_TIMERS[stageIndex] };
  room.adminComment = '';
  room.players.forEach(p => { p.status = 'waiting'; });
}

export function submitAnswer(room: Room, socketId: string, stageIndex: number, answer: unknown): boolean {
  const player = room.players.find(p => p.socketId === socketId);
  if (!player) return false;
  if (player.status !== 'waiting') return false;
  player.answers[stageIndex] = answer;
  player.status = 'submitted';
  return true;
}

export function deleteRoom(code: string) {
  const room = rooms.get(code);
  if (room?.timerInterval) clearInterval(room.timerInterval);
  rooms.delete(code);
}

export function getAllRooms(): Map<string, Room> {
  return rooms;
}
