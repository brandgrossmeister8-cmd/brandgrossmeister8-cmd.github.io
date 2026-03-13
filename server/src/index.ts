import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom, getRoom, getRoomBySocketId, addPlayer, removePlayer,
  adjustSpeed, startStage, submitAnswer, toDTO, deleteRoom
} from './room.js';
import { STAGE_TIMERS } from './types.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
});

function broadcastRoom(roomCode: string) {
  const room = getRoom(roomCode);
  if (!room) return;
  const dto = toDTO(room);
  io.to(roomCode).emit('room-updated', dto);
}

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('create-room', () => {
    const room = createRoom(socket.id);
    socket.join(room.code);
    socket.emit('room-created', toDTO(room));
  });

  socket.on('join-room', ({ code, name, business }: { code: string; name: string; business?: string }) => {
    if (!code || !name || typeof code !== 'string' || typeof name !== 'string') {
      socket.emit('error', { message: 'Некорректные данные' });
      return;
    }
    const room = getRoom(code.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Комната не найдена' });
      return;
    }
    const normalizedBusiness = typeof business === 'string' ? business.trim() : '';
    const player = addPlayer(room, socket.id, name.trim(), normalizedBusiness);
    if (!player) {
      socket.emit('error', { message: 'Невозможно присоединиться' });
      return;
    }
    socket.join(room.code);
    socket.emit('room-joined', { state: toDTO(room), playerId: player.id });
    broadcastRoom(room.code);
  });

  socket.on('join-spectator', ({ code }: { code: string }) => {
    if (!code || typeof code !== 'string') {
      socket.emit('error', { message: 'Некорректный код' });
      return;
    }
    const room = getRoom(code.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Комната не найдена' });
      return;
    }
    room.spectatorSocketIds.add(socket.id);
    socket.join(room.code);
    socket.emit('room-joined', { state: toDTO(room), playerId: null });
  });

  socket.on('start-game', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.adminSocketId !== socket.id) return;
    if (room.players.length === 0) return;
    startStage(room, 0);
    broadcastRoom(room.code);
  });

  socket.on('submit-answer', ({ stageIndex, answer }: { stageIndex: number; answer: unknown }) => {
    const room = getRoomBySocketId(socket.id);
    if (!room) return;
    if (typeof stageIndex !== 'number') return;
    submitAnswer(room, socket.id, stageIndex, answer);
    broadcastRoom(room.code);
  });

  socket.on('admin-adjust-speed', ({ playerId, delta }: { playerId: string; delta: number }) => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.adminSocketId !== socket.id) return;
    if (delta !== 10 && delta !== -10) return;
    adjustSpeed(room, playerId, delta as 10 | -10, room.currentStage);
    broadcastRoom(room.code);
  });

  socket.on('admin-broadcast-comment', ({ comment }: { comment: string }) => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.adminSocketId !== socket.id) return;
    if (typeof comment !== 'string') return;
    room.adminComment = comment.substring(0, 2000);
    room.phase = 'expert-comment';
    room.players.forEach(p => { p.status = 'comment'; });
    broadcastRoom(room.code);
  });

  socket.on('admin-next-stage', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.adminSocketId !== socket.id) return;
    const next = room.currentStage + 1;
    if (next >= STAGE_TIMERS.length) {
      room.phase = 'final';
    } else {
      startStage(room, next);
    }
    broadcastRoom(room.code);
  });

  socket.on('admin-finish-game', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.adminSocketId !== socket.id) return;
    room.phase = 'final';
    if (room.timerInterval) { clearInterval(room.timerInterval); room.timerInterval = null; }
    broadcastRoom(room.code);
  });

  socket.on('admin-timer-control', ({ action }: { action: string }) => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.adminSocketId !== socket.id) return;

    switch (action) {
      case 'start':
      case 'resume':
        if (room.timer.remaining <= 0) break;
        room.timer.running = true;
        if (room.timerInterval) clearInterval(room.timerInterval);
        room.timerInterval = setInterval(() => {
          room.timer.remaining -= 1;
          io.to(room.code).emit('timer-tick', room.timer.remaining);
          if (room.timer.remaining <= 0) {
            room.timer.running = false;
            if (room.timerInterval) { clearInterval(room.timerInterval); room.timerInterval = null; }
            io.to(room.code).emit('timer-ended');
          }
        }, 1000);
        break;
      case 'pause':
        room.timer.running = false;
        if (room.timerInterval) { clearInterval(room.timerInterval); room.timerInterval = null; }
        break;
      case 'restart': {
        room.timer.running = false;
        if (room.timerInterval) { clearInterval(room.timerInterval); room.timerInterval = null; }
        const stageIdx = room.currentStage;
        if (stageIdx >= 0 && stageIdx < STAGE_TIMERS.length) {
          room.timer.remaining = STAGE_TIMERS[stageIdx];
          room.timer.total = STAGE_TIMERS[stageIdx];
        }
        break;
      }
    }
    broadcastRoom(room.code);
  });

  socket.on('admin-set-spectator-mode', ({ mode, focusPlayerId }: { mode: string; focusPlayerId?: string }) => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.adminSocketId !== socket.id) return;
    const validModes = ['track', 'ranking', 'focus', 'comment', 'final'];
    if (!validModes.includes(mode)) return;
    room.spectatorMode = mode as any;
    room.focusPlayerId = focusPlayerId;
    broadcastRoom(room.code);
  });

  socket.on('admin-expert-continue', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.adminSocketId !== socket.id) return;
    const next = room.currentStage + 1;
    if (next >= STAGE_TIMERS.length) {
      room.phase = 'final';
    } else {
      startStage(room, next);
    }
    broadcastRoom(room.code);
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    const room = getRoomBySocketId(socket.id);
    if (!room) return;

    // Remove spectator
    room.spectatorSocketIds.delete(socket.id);

    // Mark player disconnected
    removePlayer(room, socket.id);
    broadcastRoom(room.code);

    // If admin disconnects and no players, clean up
    if (room.adminSocketId === socket.id && room.players.every(p => !p.connected)) {
      deleteRoom(room.code);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🏎️  Marketing Race Server running on port ${PORT}`);
});
