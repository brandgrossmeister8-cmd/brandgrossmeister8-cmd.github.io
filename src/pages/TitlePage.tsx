import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GAME_TITLE, BRAND_NAME } from '@/config/stages';
import { isAuthorized, getHostName, getSavedCode } from '@/config/accessCodes';
import { motion } from 'framer-motion';

const TitlePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthorized()) navigate('/access', { replace: true });
  }, [navigate]);

  if (!isAuthorized()) return null;

  const savedCode = getSavedCode();
  const hostName = savedCode === 'MASTER'
    ? (localStorage.getItem('game-host-display-name') || 'Администратор')
    : savedCode ? getHostName(savedCode) : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6838CE] relative overflow-hidden">
      {/* Track lines decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-white opacity-10" />
        <div className="absolute top-2/4 left-0 right-0 h-px bg-white opacity-5" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-white opacity-10" />
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-4 bg-white opacity-15"
            style={{ left: `${5 + i * 5}%`, top: '48%' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-4 text-center px-4"
      >
        {/* Brand name - white */}
        <h1 className="text-2xl font-bold text-white tracking-wide">
          {BRAND_NAME}
        </h1>
        {hostName && (
          <p className="text-white/60 text-sm">Ведущий: {hostName}</p>
        )}

        {/* Dashboard frame - blue */}
        <div className="bg-[#1E0F6E] rounded-2xl border border-white/20 p-8 shadow-2xl w-full max-w-lg">
          <h2 className="text-3xl font-bold text-white mb-2">{GAME_TITLE}</h2>
          <p className="text-white/70 mb-4 text-sm">
            Интерактивная бизнес-игра
          </p>

          {/* Speedometer decoration */}
          <div className="flex items-center justify-center gap-6 mb-2">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-gradient-brand">60</span>
              <span className="text-xs text-white/60">км/ч старт</span>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-spectator">120</span>
              <span className="text-xs text-white/60">км/ч макс</span>
            </div>
          </div>

          {/* Animated racing car track */}
          <div className="relative w-full h-16 mb-6 overflow-hidden">
            {/* Road */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 rounded-full bg-white/10 border border-white/10" />
            {/* Dashed center line */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-px border-t border-dashed border-white/20" />
            {/* Animated car going right */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2"
              animate={{ left: ['0%', '85%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            >
              <motion.span
                className="text-5xl block"
                style={{ filter: 'sepia(1) saturate(5) hue-rotate(-10deg) brightness(1.1)' }}
                animate={{ scaleX: [-1, -1, 1, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear', times: [0, 0.49, 0.5, 1] }}
              >
                🏎️
              </motion.span>
            </motion.div>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full bg-white text-[#2A168F] hover:bg-white/90 font-bold"
            onClick={() => navigate('/rules')}
          >
            Далее →
          </Button>
        </div>

        <p className="text-white/50 text-sm mt-2">
          Тренинг на основе технологии системного продвижения Ии Имшинецкой
        </p>
      </motion.div>
    </div>
  );
};

export default TitlePage;
