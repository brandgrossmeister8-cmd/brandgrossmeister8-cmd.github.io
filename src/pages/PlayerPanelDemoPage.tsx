import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandHeader } from '@/components/game/BrandHeader';
import { SpeedBadge } from '@/components/game/SpeedBadge';
import { TimerDisplay } from '@/components/game/TimerDisplay';
import { MiniTrack } from '@/components/game/MiniTrack';
import { RaceTrack } from '@/components/game/RaceTrack';
import { Leaderboard } from '@/components/game/Leaderboard';
import { StageAnswer } from '@/components/game/StageAnswer';
import { Button } from '@/components/ui/button';
import { STAGES } from '@/config/stages';
import { Player } from '@/types/game';

const demoPlayers: Player[] = [
  { id: 'p1', name: 'Игрок 1', speed: 70, position: 1, status: 'waiting', connected: true, answers: {} },
  { id: 'p2', name: 'Игрок 2', speed: 60, position: 2, status: 'waiting', connected: true, answers: {} },
  { id: 'p3', name: 'Игрок 3', speed: 50, position: 3, status: 'waiting', connected: true, answers: {} },
];

const PlayerPanelDemoPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageIndex, setStageIndex] = useState(4); // По умолчанию "Цалово" с карточками
  const [submittedByStage, setSubmittedByStage] = useState<Record<number, boolean>>({});
  const [showOverview, setShowOverview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stage = STAGES[stageIndex];
  const me = demoPlayers[1];

  const sortedPlayers = useMemo(
    () => [...demoPlayers].sort((a, b) => b.speed - a.speed),
    []
  );

  const markSubmitted = () => {
    setSubmittedByStage(prev => ({ ...prev, [stageIndex]: true }));
  };

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenEnabled) return;
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
      return;
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background bg-speed-lines px-4 py-6 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand" />
      <div
        className="absolute top-1 left-0 right-0 h-[3px]"
        style={{
          background:
            'repeating-linear-gradient(90deg, hsl(0 72% 51%) 0px, hsl(0 72% 51%) 10px, hsl(0 0% 100% / 0.9) 10px, hsl(0 0% 100% / 0.9) 20px)',
        }}
      />

      <BrandHeader subtitle="Демо панели игрока (для объяснения)" compact />

      <div className="max-w-md mx-auto mt-2 space-y-4">
        <div className="bg-card rounded-xl border p-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Покажите игрокам, как выглядит их экран. После объяснения нажмите кнопку перехода в панель ведущего.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STAGES.map((s, idx) => (
              <Button
                key={s.index}
                variant={idx === stageIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStageIndex(idx)}
              >
                {s.cityName}
              </Button>
            ))}
          </div>
        </div>

        {showOverview ? (
          <div className="space-y-4">
            <RaceTrack players={sortedPlayers} />
            <Leaderboard players={sortedPlayers} />
            <Button variant="outline" className="w-full" onClick={() => setShowOverview(false)}>
              ← Вернуться к панели игрока
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {stage.title}: <span className="text-gradient-brand">{stage.cityName}</span>
              </h2>
              <SpeedBadge speed={me.speed} size="md" />
            </div>

            <TimerDisplay remaining={stage.timerSeconds} total={stage.timerSeconds} running />

            <MiniTrack players={sortedPlayers} myId={me.id} />

            <StageAnswer
              stage={stage}
              onSubmit={markSubmitted}
              disabled={false}
              submitted={!!submittedByStage[stageIndex]}
            />

            {submittedByStage[stageIndex] && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setSubmittedByStage(prev => ({ ...prev, [stageIndex]: false }))
                }
              >
                Сбросить демонстрацию ответа
              </Button>
            )}

            <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowOverview(true)}>
              👁️ Показать общий обзор трассы
            </Button>
          </>
        )}

        <div className="grid grid-cols-1 gap-2">
          <Button variant="race" size="lg" className="w-full" onClick={toggleFullscreen}>
            {isFullscreen ? '🗗 Выйти из полноэкранного режима' : '🗖 Показать на весь экран'}
          </Button>
          <Button variant="hero" size="lg" className="w-full" onClick={() => navigate('/admin')}>
            ➡️ Перейти в панель ведущего
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/lobby')}>
            ← Вернуться в лобби
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerPanelDemoPage;
