import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { BrandHeader } from '@/components/game/BrandHeader';
import { Button } from '@/components/ui/button';
import { MAX_PLAYERS } from '@/config/stages';
import { motion } from 'framer-motion';

const LobbyPage = () => {
  const navigate = useNavigate();
  const game = useGame();
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');

  useEffect(() => {
    if (!game.roomState) game.createRoom();
    if (game.role !== 'admin') game.setRole('admin');
  }, [game]);

  const players = game.roomState?.players ?? [];

  const handleAddPlayer = () => {
    if (!name.trim() || !business.trim()) return;
    if (players.length >= MAX_PLAYERS) return;
    game.adminAddPlayer(name.trim(), business.trim());
    setName('');
    setBusiness('');
  };

  const handleStartGame = () => {
    game.startGame();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        <BrandHeader subtitle="Регистрация игроков перед стартом" />

        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-brand">
          <p className="text-sm text-muted-foreground">
            Введите имя и бизнес каждого участника. После этого нажмите `Начать игру`.
          </p>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя игрока"
            maxLength={24}
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Бизнес игрока"
            maxLength={60}
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleAddPlayer}
            disabled={!name.trim() || !business.trim() || players.length >= MAX_PLAYERS}
          >
            Добавить игрока
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Список игроков ({players.length}/{MAX_PLAYERS})</p>
            {players.length === 0 && (
              <p className="text-sm text-muted-foreground">Пока никто не добавлен</p>
            )}
            {players.map((p, idx) => (
              <div key={p.id} className="p-2 rounded-lg bg-muted/50 text-sm">
                <span className="font-semibold">Игрок {idx + 1}: {p.name}</span>
                <span className="text-muted-foreground"> — {p.business}</span>
              </div>
            ))}
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleStartGame}
            disabled={players.length === 0}
          >
            Начать игру
          </Button>

          <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/rules')}>
            ← Далее назад
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LobbyPage;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { BrandHeader } from '@/components/game/BrandHeader';
import { Button } from '@/components/ui/button';
import { MAX_PLAYERS } from '@/config/stages';
import { motion } from 'framer-motion';

const LobbyPage = () => {
  const navigate = useNavigate();
  const game = useGame();
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');

  useEffect(() => {
    if (!game.roomState) game.createRoom();
    if (game.role !== 'admin') game.setRole('admin');
  }, [game]);

  const players = game.roomState?.players ?? [];

  const handleAddPlayer = () => {
    if (!name.trim() || !business.trim()) return;
    if (players.length >= MAX_PLAYERS) return;
    game.adminAddPlayer(name.trim(), business.trim());
    setName('');
    setBusiness('');
  };

  const handleStartGame = () => {
    game.startGame();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        <BrandHeader subtitle="Регистрация игроков перед стартом" />

        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-brand">
          <p className="text-sm text-muted-foreground">
            Введите имя и бизнес каждого участника. После этого нажмите `Начать игру`.
          </p>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя игрока"
            maxLength={24}
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Бизнес игрока"
            maxLength={60}
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleAddPlayer}
            disabled={!name.trim() || !business.trim() || players.length >= MAX_PLAYERS}
          >
            Добавить игрока
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Список игроков ({players.length}/{MAX_PLAYERS})
            </p>
            {players.length === 0 && (
              <p className="text-sm text-muted-foreground">Пока никто не добавлен</p>
            )}
            {players.map((p, idx) => (
              <div key={p.id} className="p-2 rounded-lg bg-muted/50 text-sm">
                <span className="font-semibold">Игрок {idx + 1}: {p.name}</span>
                <span className="text-muted-foreground"> — {p.business}</span>
              </div>
            ))}
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleStartGame}
            disabled={players.length === 0}
          >
            Начать игру
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => navigate('/rules')}
          >
            ← Далее назад
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LobbyPage;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { BrandHeader } from '@/components/game/BrandHeader';
import { Button } from '@/components/ui/button';
import { MAX_PLAYERS } from '@/config/stages';
import { motion } from 'framer-motion';

const LobbyPage = () => {
  const navigate = useNavigate();
  const game = useGame();
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');

  const handleStartGame = () => {
    game.startGame();
    navigate('/admin');
  };

  useEffect(() => {
    if (!game.roomState) {
      game.createRoom();
    }
    if (game.role !== 'admin') {
      game.setRole('admin');
    }
  }, [game]);

  const players = game.roomState?.players ?? [];

  const handleAddPlayer = () => {
    if (!name.trim() || !business.trim()) return;
    if (players.length >= MAX_PLAYERS) return;
    game.adminAddPlayer(name.trim(), business.trim());
    setName('');
    setBusiness('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full space-y-6">
        <BrandHeader subtitle="Регистрация игроков перед стартом" />

        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-brand">
          <p className="text-sm text-muted-foreground">
            Введите имя и бизнес каждого участника. После этого запускайте игру.
          </p>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя игрока"
            maxLength={24}
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Бизнес игрока"
            maxLength={60}
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleAddPlayer}
            disabled={!name.trim() || !business.trim() || players.length >= MAX_PLAYERS}
          >
            Добавить игрока
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Список игроков ({players.length}/{MAX_PLAYERS})</p>
            {players.length === 0 && (
              <p className="text-sm text-muted-foreground">Пока никто не добавлен</p>
            )}
            {players.map((p, idx) => (
              <div key={p.id} className="p-2 rounded-lg bg-muted/50 text-sm">
                <span className="font-semibold">Игрок {idx + 1}: {p.name}</span>
                <span className="text-muted-foreground"> — {p.business}</span>
              </div>
            ))}
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleStartGame}
            disabled={players.length === 0}
          >
            Начать игру
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/rules')}>
            ← Далее назад
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LobbyPage;
          </div>
        )}

        {mode === 'player' && (
          <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-brand">
            <h2 className="text-lg font-bold text-center">Регистрация</h2>
            {code && (
              <div className="text-center p-3 rounded-lg bg-gradient-brand">
                <p className="text-primary-foreground text-xs mb-1">Код комнаты</p>
                <p className="text-2xl font-bold text-primary-foreground tracking-widest">{code}</p>
              </div>
            )}
            {!codeFromUrl && (
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Код комнаты"
                maxLength={6}
                className="w-full p-3 rounded-lg border bg-background text-center text-2xl font-bold tracking-widest uppercase focus:ring-2 focus:ring-primary outline-none"
              />
            )}
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя"
              maxLength={20}
              className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              value={business}
              onChange={e => setBusiness(e.target.value)}
              placeholder="Ваш бизнес (например: строительный, детский центр)"
              maxLength={50}
              className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
            />
            {game.error && <p className="text-destructive text-sm text-center">{game.error}</p>}
            <Button variant="hero" size="lg" className="w-full" onClick={handleJoin} disabled={!code || !name || !business}>
              Присоединиться
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setMode('select')}>
              ← Назад
            </Button>
          </div>
        )}

        {mode === 'spectator' && (
          <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-brand">
            <h2 className="text-lg font-bold text-center">Режим зрителя</h2>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Код комнаты"
              maxLength={6}
              className="w-full p-3 rounded-lg border bg-background text-center text-2xl font-bold tracking-widest uppercase focus:ring-2 focus:ring-primary outline-none"
            />
            <Button variant="spectator" size="lg" className="w-full" onClick={handleJoinSpectator} disabled={!code}>
              Смотреть
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setMode('select')}>
              ← Назад
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LobbyPage;
