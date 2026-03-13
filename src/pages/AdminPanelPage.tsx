import { useGame } from '@/contexts/GameContext';
import { BrandHeader } from '@/components/game/BrandHeader';
import { TimerDisplay } from '@/components/game/TimerDisplay';
import { PlayerCard } from '@/components/game/PlayerCard';
import { RaceTrack } from '@/components/game/RaceTrack';
import { Leaderboard } from '@/components/game/Leaderboard';
import { STAGES, getInterpretation } from '@/config/stages';
import { SpectatorMode } from '@/types/game';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const AdminPanelPage = () => {
  const game = useGame();
  const { roomState } = game;

  if (!roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  const stage = roomState.currentStage >= 0 ? STAGES[roomState.currentStage] : null;
  const isPlaying = roomState.phase === 'playing';
  const isExpert = roomState.phase === 'expert-comment';
  const isFinal = roomState.phase === 'final';

  // Final screen
  if (isFinal) {
    const sorted = [...roomState.players].sort((a, b) => b.speed - a.speed);
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <BrandHeader subtitle="Финиш — Панель ведущего" compact />
        <div className="max-w-4xl mx-auto space-y-6 mt-4">
          <div className="text-center">
            <span className="text-6xl">🏁</span>
            <h2 className="text-2xl font-bold">Гонка завершена!</h2>
          </div>
          <RaceTrack players={sorted} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map(p => (
              <div key={p.id} className="bg-card rounded-xl border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-sm font-medium">#{p.position}</span>
                </div>
                <p className="text-2xl font-bold text-gradient-brand">{p.speed} км/ч</p>
                <p className="text-xs text-muted-foreground italic">{getInterpretation(p.speed)}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => {
              game.setSpectatorMode('final');
              window.open('/spectator', '_blank');
            }}>
              📺 Показать финал зрителям
            </Button>
            <Button variant="hero" className="flex-1" onClick={() => game.restartGame()}>
              🔄 Новая игра
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const spectatorModes: { mode: SpectatorMode; label: string }[] = [
    { mode: 'track', label: '🏎️ Трасса' },
    { mode: 'focus', label: '🔍 Фокус — выбор игрока' },
    { mode: 'comment', label: '💬 Комментарий' },
    { mode: 'final', label: '🏁 Финал' },
  ];

  return (
    <div className="min-h-screen bg-background bg-speed-lines px-4 py-4 relative">
      {/* Racing stripe top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand" />
      <div className="absolute top-1 left-0 right-0 h-[3px]" style={{
        background: 'repeating-linear-gradient(90deg, hsl(0 72% 51%) 0px, hsl(0 72% 51%) 10px, hsl(0 0% 100% / 0.9) 10px, hsl(0 0% 100% / 0.9) 20px)'
      }} />
      <BrandHeader subtitle={`Панель ведущего${stage ? ` — ${stage.cityName}` : ''}`} compact />

      <div className="max-w-6xl mx-auto space-y-4 mt-2">
        {/* Top bar: stage + timer + controls */}
        <div className="flex flex-wrap items-center gap-4 bg-card rounded-xl border p-4">
          {stage && (
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-bold text-lg">{stage.title}: <span className="text-gradient-brand">{stage.cityName}</span></h2>
              <p className="text-xs text-muted-foreground">{stage.question}</p>
            </div>
          )}

          <TimerDisplay
            remaining={roomState.timer.remaining}
            total={roomState.timer.total}
            running={roomState.timer.running}
            className="min-w-[140px]"
          />

          <div className="flex gap-2 flex-wrap">
            {!roomState.timer.running && roomState.timer.remaining > 0 && (
              <Button size="sm" variant="success" onClick={() => game.timerControl(roomState.timer.remaining === roomState.timer.total ? 'start' : 'resume')}>
                ▶️ {roomState.timer.remaining === roomState.timer.total ? 'Старт' : 'Продолжить'}
              </Button>
            )}
            {roomState.timer.running && (
              <Button size="sm" variant="outline" onClick={() => game.timerControl('pause')}>⏸️ Пауза</Button>
            )}
            <Button size="sm" variant="outline" onClick={() => game.timerControl('restart')}>🔄 Сброс</Button>
            {isExpert && (
              <Button size="sm" variant="success" onClick={() => game.expertContinue()}>
                ➡️ Следующий этап
              </Button>
            )}
            {isPlaying && roomState.currentStage < STAGES.length - 1 && (
              <Button size="sm" variant="success" onClick={() => game.nextStage()}>
                ⏭️ Следующий этап
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => game.finishGame()}>
              🏁 Завершить гонку
            </Button>
          </div>
        </div>

        {/* Race track overview */}
        <RaceTrack players={roomState.players} compact />

        {/* Player grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roomState.players.map(player => (
            <motion.div key={player.id} layout>
              <PlayerCard
                player={player}
                showAnswer
                showControls={isPlaying || isExpert}
                currentStage={roomState.currentStage}
                stageConfig={stage ?? undefined}
                onAdjustSpeed={(delta) => game.adjustSpeed(player.id, delta)}
              />
            </motion.div>
          ))}
        </div>

        {/* Spectator mode controls */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <h3 className="font-bold text-sm">📺 Управление экраном зрителя</h3>
          <div className="flex flex-wrap gap-2">
            {spectatorModes.map(({ mode, label }) => (
              <Button
                key={mode}
                size="sm"
                variant={roomState.spectatorMode === mode ? 'default' : 'outline'}
                onClick={() => game.setSpectatorMode(mode)}
              >
                {label}
              </Button>
            ))}
          </div>
          {roomState.spectatorMode === 'focus' && (
            <div className="flex flex-wrap gap-2">
              {roomState.players.map(p => (
                <Button
                  key={p.id}
                  size="sm"
                  variant={roomState.focusPlayerId === p.id ? 'secondary' : 'ghost'}
                  onClick={() => game.setSpectatorMode('focus', p.id)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
