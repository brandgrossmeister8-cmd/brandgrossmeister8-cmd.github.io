import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { RoomState, Player, GamePhase, SpectatorMode, Role, PlayerStatus } from '@/types/game';
import { INITIAL_SPEED, MAX_PLAYERS, STAGES } from '@/config/stages';
import { connectSocket, isSocketAvailable, disconnectSocket } from '@/lib/socket';

interface GameContextType {
  role: Role | null;
  roomState: RoomState | null;
  myPlayerId: string | null;
  error: string | null;
  connected: boolean;
  isDemo: boolean;

  createRoom: () => void;
  joinRoom: (code: string, name: string) => void;
  joinAsSpectator: (code: string) => void;
  startGame: () => void;
  submitAnswer: (stageIndex: number, answer: unknown) => void;
  adjustSpeed: (playerId: string, delta: 10 | -10) => void;
  broadcastComment: (comment: string) => void;
  setPlayerComment: (playerId: string, comment: string) => void;
  nextStage: () => void;
  finishGame: () => void;
  timerControl: (action: 'start' | 'pause' | 'resume' | 'restart') => void;
  setSpectatorMode: (mode: SpectatorMode, focusPlayerId?: string) => void;
  expertContinue: () => void;
  setRole: (role: Role | null) => void;
  restartGame: () => void;
  addDemoPlayers: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

// Shared demo room storage via localStorage for cross-tab support
function saveDemoRoom(room: RoomState) {
  try {
    const rooms = JSON.parse(localStorage.getItem('demo_rooms') || '{}');
    rooms[room.code] = room;
    localStorage.setItem('demo_rooms', JSON.stringify(rooms));
  } catch {}
}

function getDemoRoom(code: string): RoomState | null {
  try {
    const rooms = JSON.parse(localStorage.getItem('demo_rooms') || '{}');
    return rooms[code] || null;
  } catch { return null; }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDemo = !isSocketAvailable();

  useEffect(() => {
    if (!isDemo) {
      const socket = connectSocket();
      if (socket) {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('room-created', (state: RoomState) => { setRoomState(state); });
        socket.on('room-updated', (state: RoomState) => { setRoomState(state); });
        socket.on('room-joined', (data: { state: RoomState; playerId: string }) => {
          setRoomState(data.state);
          if (data.playerId) setMyPlayerId(data.playerId);
        });
        socket.on('error', (msg: { message: string }) => setError(msg.message));
        socket.on('timer-tick', (remaining: number) => {
          setRoomState(prev => prev ? { ...prev, timer: { ...prev.timer, remaining } } : prev);
        });
        socket.on('timer-ended', () => {
          setRoomState(prev => prev ? { ...prev, timer: { ...prev.timer, running: false, remaining: 0 } } : prev);
        });
        return () => { disconnectSocket(); };
      }
    } else {
      setConnected(true);
      
      // В демо-режиме: загружаем последнюю комнату при старте (для зрителей в новой вкладке)
      try {
        const rooms = JSON.parse(localStorage.getItem('demo_rooms') || '{}');
        const codes = Object.keys(rooms);
        if (codes.length > 0) {
          const lastCode = codes[codes.length - 1];
          const lastRoom = rooms[lastCode];
          if (lastRoom) {
            setRoomState(lastRoom);
          }
        }
      } catch {}
      
      // Подписываемся на изменения localStorage для синхронизации между вкладками
      const syncHandler = (e: StorageEvent) => {
        if (e.key === 'demo_rooms' && e.newValue) {
          try {
            const rooms = JSON.parse(e.newValue);
            const codes = Object.keys(rooms);
            if (codes.length > 0) {
              const lastCode = codes[codes.length - 1];
              const lastRoom = rooms[lastCode];
              if (lastRoom) {
                setRoomState(lastRoom);
              }
            }
          } catch {}
        }
      };
      window.addEventListener('storage', syncHandler);
      return () => window.removeEventListener('storage', syncHandler);
    }
  }, [isDemo]);

  // Автоматически сохраняем изменения roomState в localStorage (только в демо-режиме)
  useEffect(() => {
    if (isDemo && roomState) {
      saveDemoRoom(roomState);
    }
  }, [isDemo, roomState]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const generateDemoAnswers = useCallback((stageIndex: number) => {
    const stage = STAGES[stageIndex];
    if (!stage) return;
    
    const demoAnswers: Record<string, unknown> = {};
    
    setRoomState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.map(p => {
          let answer: unknown;
          switch (stage.answerType) {
            case 'single-choice':
              if (stage.options) {
                const opt = stage.options[Math.floor(Math.random() * stage.options.length)];
                answer = opt.id;
              }
              break;
            case 'slider':
              answer = Math.floor(Math.random() * 100);
              break;
            case 'textarea':
              const textAnswers = [
                'Клиенты ценят качество и надёжность нашего продукта',
                'Основная мотивация — экономия времени и удобство',
                'Покупают из-за уникального сервиса и поддержки',
                'Привлекает соотношение цены и качества',
                'Нужен для решения конкретной бизнес-задачи',
                'Рекомендации от коллег и партнёров',
              ];
              answer = textAnswers[Math.floor(Math.random() * textAnswers.length)];
              break;
            case 'choice-then-cards':
              const type = Math.random() > 0.5 ? 'B2B' : 'B2C';
              const demoB2B = {
                'market': 'Корпоративный',
                'why-business': 'Оптимизация процессов',
                'industry': 'IT',
                'business-size': '50-200 чел',
                'relationship': 'Долгосрочно',
                'decision-maker': 'Директор по развитию',
                'personal-why': 'Карьерный рост',
              };
              const demoB2C = {
                'market': 'Массовый',
                'why': 'Для семьи',
                'behavior': 'Рациональная',
                'family': 'Семья 3-4 человека',
                'children': '2 детей',
                'location': 'Горожане',
                'age': '30-45',
                'gender': 'Не важно',
                'economy': 'Средний доход',
                'motive': 'Удобство',
              };
              answer = { type, params: type === 'B2B' ? demoB2B : demoB2C };
              break;
          }
          return {
            ...p,
            status: 'submitted' as PlayerStatus,
            answers: { ...p.answers, [stageIndex]: answer },
          };
        }),
      };
    });
  }, []);

  const startLocalTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setRoomState(prev => {
        if (!prev || !prev.timer.running) return prev;
        const remaining = prev.timer.remaining - 1;
        if (remaining <= 0) {
          clearTimer();
          return { ...prev, timer: { ...prev.timer, running: false, remaining: 0 } };
        }
        return { ...prev, timer: { ...prev.timer, remaining } };
      });
    }, 1000);
  }, [clearTimer]);

  // Demo mode implementations
  const createRoom = useCallback(() => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('create-room');
      return;
    }
    const code = generateCode();
    const adminId = generateId();
    setMyPlayerId(adminId);
    setRole('admin');
    const room: RoomState = {
      id: generateId(),
      code,
      adminId,
      players: [],
      phase: 'lobby',
      currentStage: -1,
      timer: { running: false, remaining: 0, total: 0 },
      spectatorMode: 'track',
      adminComment: '',
    };
    setRoomState(room);
    saveDemoRoom(room);
  }, [isDemo]);

  const joinRoom = useCallback((code: string, name: string) => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('join-room', { code, name });
      setRole('player');
      return;
    }
    // In demo mode, check both current state AND localStorage for cross-tab support
    setRoomState(prev => {
      let room = prev;
      if (!room || room.code !== code) {
        room = getDemoRoom(code);
      }
      if (!room || room.code !== code) {
        setError('Комната не найдена');
        return prev;
      }
      if (room.players.length >= MAX_PLAYERS) {
        setError('Максимум 6 игроков');
        return room;
      }
      const playerId = generateId();
      setMyPlayerId(playerId);
      setRole('player');
      setError(null);
      const newPlayer: Player = {
        id: playerId, name, speed: INITIAL_SPEED, position: room.players.length + 1,
        status: 'waiting', connected: true, answers: {},
      };
      const updated = { ...room, players: [...room.players, newPlayer] };
      saveDemoRoom(updated);
      return updated;
    });
  }, [isDemo]);

  const joinAsSpectator = useCallback((code: string) => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('join-spectator', { code });
      setRole('spectator');
      return;
    }
    setRole('spectator');
  }, [isDemo]);

  const startGame = useCallback(() => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('start-game');
      return;
    }
    setRoomState(prev => {
      if (!prev) return prev;
      const stage = STAGES[0];
      return {
        ...prev,
        phase: 'playing',
        currentStage: 0,
        timer: { running: false, remaining: stage.timerSeconds, total: stage.timerSeconds },
        players: prev.players.map(p => ({ ...p, status: 'waiting' as PlayerStatus })),
      };
    });
  }, [isDemo]);

  const submitAnswer = useCallback((stageIndex: number, answer: unknown) => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('submit-answer', { stageIndex, answer });
      return;
    }
    setRoomState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.map(p =>
          p.id === myPlayerId
            ? { ...p, status: 'submitted' as PlayerStatus, answers: { ...p.answers, [stageIndex]: answer } }
            : p
        ),
      };
    });
  }, [isDemo, myPlayerId]);

  const adjustSpeed = useCallback((playerId: string, delta: 10 | -10) => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('admin-adjust-speed', { playerId, delta });
      return;
    }
    setRoomState(prev => {
      if (!prev) return prev;
      const currentStage = prev.currentStage;
      const players = prev.players.map(p =>
        p.id === playerId ? { 
          ...p, 
          speed: Math.max(0, p.speed + delta), 
          status: 'decided' as PlayerStatus,
          lastSpeedDelta: { ...(p.lastSpeedDelta || {}), [currentStage]: delta }
        } : p
      );
      // Recalculate positions
      const sorted = [...players].sort((a, b) => b.speed - a.speed);
      sorted.forEach((p, i) => { p.position = i + 1; });
      return { ...prev, players: players.map(p => ({ ...p, position: sorted.findIndex(s => s.id === p.id) + 1 })) };
    });
  }, [isDemo]);

  const broadcastComment = useCallback((comment: string) => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('admin-broadcast-comment', { comment });
      return;
    }
    setRoomState(prev => prev ? { ...prev, adminComment: comment, phase: 'expert-comment' as GamePhase,
      players: prev.players.map(p => ({ ...p, status: 'comment' as PlayerStatus })) } : prev);
  }, [isDemo]);

  const setPlayerComment = useCallback((playerId: string, comment: string) => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('admin-player-comment', { playerId, comment });
      return;
    }
    setRoomState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.map(p =>
          p.id === playerId ? { ...p, adminPlayerComment: comment } : p
        ),
      };
    });
  }, [isDemo]);

  const nextStage = useCallback(() => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('admin-next-stage');
      return;
    }
    setRoomState(prev => {
      if (!prev) return prev;
      const next = prev.currentStage + 1;
      if (next >= STAGES.length) return { ...prev, phase: 'final' };
      const stage = STAGES[next];
      return {
        ...prev, currentStage: next, phase: 'playing',
        timer: { running: false, remaining: stage.timerSeconds, total: stage.timerSeconds },
        adminComment: '',
        players: prev.players.map(p => ({ ...p, status: 'waiting' as PlayerStatus })),
      };
    });
  }, [isDemo]);

  const finishGame = useCallback(() => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('admin-finish-game');
      return;
    }
    setRoomState(prev => prev ? { ...prev, phase: 'final' } : prev);
  }, [isDemo]);

  const timerControl = useCallback((action: 'start' | 'pause' | 'resume' | 'restart') => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('admin-timer-control', { action });
      return;
    }
    setRoomState(prev => {
      if (!prev) return prev;
      const stage = STAGES[prev.currentStage];
      if (!stage) return prev;
      switch (action) {
        case 'start':
          startLocalTimer();
          // Generate demo answers after a random delay
          setTimeout(() => generateDemoAnswers(prev.currentStage), 1500 + Math.random() * 3000);
          return { ...prev, timer: { ...prev.timer, running: true } };
        case 'resume':
          startLocalTimer();
          return { ...prev, timer: { ...prev.timer, running: true } };
        case 'pause':
          clearTimer();
          return { ...prev, timer: { ...prev.timer, running: false } };
        case 'restart':
          clearTimer();
          const newTimer = { running: false, remaining: stage.timerSeconds, total: stage.timerSeconds };
          return { ...prev, timer: newTimer, players: prev.players.map(p => ({ ...p, status: 'waiting' as PlayerStatus })) };
        default: return prev;
      }
    });
  }, [isDemo, startLocalTimer, clearTimer, generateDemoAnswers]);

  const setSpectatorModeCtx = useCallback((mode: SpectatorMode, focusPlayerId?: string) => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('admin-set-spectator-mode', { mode, focusPlayerId });
      return;
    }
    setRoomState(prev => prev ? { ...prev, spectatorMode: mode, focusPlayerId } : prev);
  }, [isDemo]);

  const expertContinue = useCallback(() => {
    if (!isDemo) {
      const socket = connectSocket();
      socket?.emit('admin-expert-continue');
      return;
    }
    nextStage();
  }, [isDemo, nextStage]);

  const restartGame = useCallback(() => {
    clearTimer();
    setRoomState(null);
    setRole(null);
    setMyPlayerId(null);
    setError(null);
  }, [clearTimer]);

  const addDemoPlayers = useCallback(() => {
    if (!isDemo) return;
    const demoNames = ['Алексей', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга'];
    const demoBusinesses = ['Строительный', 'Детский центр', 'Ювелирные изделия', 'IT-консалтинг', 'Кафе', 'Салон красоты'];
    
    setRoomState(prev => {
      if (!prev || prev.players.length >= MAX_PLAYERS) return prev;
      
      const index = prev.players.length;
      const newPlayer = {
        id: generateId(),
        name: demoNames[index],
        business: demoBusinesses[index],
        speed: INITIAL_SPEED,
        position: index + 1,
        status: 'waiting' as PlayerStatus,
        connected: true,
        answers: {},
      };
      
      return { ...prev, players: [...prev.players, newPlayer] };
    });
  }, [isDemo]);

  return (
    <GameContext.Provider value={{
      role, roomState, myPlayerId, error, connected, isDemo,
      createRoom, joinRoom, joinAsSpectator, startGame, submitAnswer,
      adjustSpeed, broadcastComment, setPlayerComment, nextStage, finishGame,
      timerControl, setSpectatorMode: setSpectatorModeCtx, expertContinue,
      setRole, restartGame, addDemoPlayers,
    }}>
      {children}
    </GameContext.Provider>
  );
}
