import { useNavigate } from 'react-router-dom';
import { BrandHeader } from '@/components/game/BrandHeader';
import { Button } from '@/components/ui/button';
import { GAME_TITLE } from '@/config/stages';
import { motion } from 'framer-motion';

const TitlePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-dark relative overflow-hidden">
      {/* Track lines decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-track-line opacity-20" />
        <div className="absolute top-2/4 left-0 right-0 h-px bg-track-line opacity-10" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-track-line opacity-20" />
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-4 bg-track-line opacity-30"
            style={{ left: `${5 + i * 5}%`, top: '48%' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-8 text-center px-4"
      >
        <BrandHeader />
        
        {/* Dashboard frame */}
        <div className="bg-dashboard rounded-2xl border border-dashboard-border p-8 shadow-brand-lg max-w-lg w-full">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">🏎️</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-2">{GAME_TITLE}</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Интерактивная бизнес-игра в метафоре гоночной трассы
          </p>

          {/* Speedometer decoration */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-gradient-brand">60</span>
              <span className="text-xs text-muted-foreground">км/ч старт</span>
            </div>
            <div className="w-px h-12 bg-dashboard-border" />
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-spectator">120</span>
              <span className="text-xs text-muted-foreground">км/ч макс</span>
            </div>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={() => navigate('/rules')}
          >
            🔑 Включить зажигание
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TitlePage;
