import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { BrandHeader } from '@/components/game/BrandHeader';
import { Button } from '@/components/ui/button';
import { MAX_PLAYERS } from '@/config/stages';
import { isAuthorized } from '@/config/accessCodes';
import { motion } from 'framer-motion';

const LobbyOneScreenPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthorized()) navigate('/access', { replace: true });
  }, [navigate]);

  if (!isAuthorized()) return null;
  const game = useGame();
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    game.createRoom();
    game.setRole('admin');
  }, [game.createRoom, game.setRole]);

  const players = game.roomState?.players ?? [];

  const addPlayer = () => {
    if (!name.trim() || !business.trim() || players.length >= MAX_PLAYERS) return;
    game.adminAddPlayer(name.trim(), business.trim());
    setName('');
    setBusiness('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-6">
        <BrandHeader subtitle="Регистрация игроков перед стартом" />
        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-brand">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя игрока"
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Бизнес игрока"
            className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />
          <Button variant="outline" className="w-full" onClick={addPlayer}>
            Добавить игрока
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Список игроков ({players.length}/{MAX_PLAYERS})</p>
            {players.map((p, idx) => (
              <div key={p.id} className="p-2 rounded-lg bg-muted/50 text-sm">
                <span className="font-semibold">Игрок {idx + 1}: {p.name}</span>
                <span className="text-muted-foreground"> — {p.business}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Данные игроков не собираются и не хранятся. Все данные удаляются сразу после окончания игры.
          </p>

          <Button variant="hero" className="w-full" onClick={() => { game.startGame(); navigate('/admin'); }} disabled={players.length === 0}>
            Включить зажигание
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LobbyOneScreenPage;
