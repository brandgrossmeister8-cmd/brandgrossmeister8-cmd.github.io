import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { BrandHeader } from '@/components/game/BrandHeader';
import { RaceTrack } from '@/components/game/RaceTrack';
import { TimerDisplay } from '@/components/game/TimerDisplay';
import { PlayerCard } from '@/components/game/PlayerCard';
import { Button } from '@/components/ui/button';
import { STAGES, getInterpretation } from '@/config/stages';

type Draft = string | number | { type: string; details: string } | null;

const AdminPanelPage = () => {
  const game = useGame();
  const { roomState } = game;
  const [adminOpen, setAdminOpen] = useState(false);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, Draft>>({});

  if (!roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  const isFinal = roomState.phase === 'final';
  const stage = roomState.currentStage >= 0 ? STAGES[roomState.currentStage] : null;

  if (isFinal) {
    const sorted = [...roomState.players].sort((a, b) => b.speed - a.speed);
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <BrandHeader subtitle="Итоги игры" compact />
        <div className="w-full mx-auto mt-4 space-y-4">
          <RaceTrack players={sorted} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sorted.map((p) => (
              <div key={p.id} className="rounded-xl border bg-card p-4">
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.business}</p>
                <p className="text-2xl font-bold mt-2">{p.speed} км/ч</p>
                <p className="text-xs text-muted-foreground italic">{getInterpretation(p.speed)}</p>
              </div>
            ))}
          </div>
          <Button variant="hero" className="w-full" onClick={game.restartGame}>
            Начать новую игру
          </Button>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <BrandHeader subtitle="Подготовка игры" compact />
        <div className="w-full mx-auto mt-4">
          <p className="text-muted-foreground">Сначала добавьте игроков и нажмите `Начать игру`.</p>
        </div>
      </div>
    );
  }

  const savePlayerAnswer = (playerId: string) => {
    const value = draftAnswers[playerId];
    if (value === null || value === undefined || value === '') return;

    let answer: unknown = value;
    if (stage.answerType === 'choice-then-cards') {
      const data = value as { type: string; details: string };
      answer = { type: data.type, params: { summary: data.details } };
    }
    game.adminSetPlayerAnswer(playerId, roomState.currentStage, answer);
  };

  const allScored = roomState.players.every((p) => p.status === 'decided');

  return (
    <div className="min-h-screen bg-background px-4 py-4">
      <BrandHeader subtitle={`Этап: ${stage.cityName.toUpperCase()}`} compact />

      <div className="w-full mx-auto mt-3 space-y-4">
        {/* 1) Трасса всегда сверху */}
        <RaceTrack players={roomState.players} compact />

        {/* 2) Общий экран этапа с карточками */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-lg">
                {stage.title}: <span className="text-gradient-brand">{stage.cityName.toUpperCase()}</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{stage.question}</p>
            </div>

            <TimerDisplay
              remaining={roomState.timer.remaining}
              total={roomState.timer.total}
              running={roomState.timer.running}
              className="min-w-[170px]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {!roomState.timer.running && (
              <Button size="sm" variant="success" onClick={() => game.timerControl('start')}>
                ▶ Включить таймер
              </Button>
            )}
            {roomState.timer.running && (
              <Button size="sm" variant="outline" onClick={() => game.timerControl('pause')}>
                ⏸ Пауза
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => game.timerControl('restart')}>
              🔄 Сброс таймера
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={game.nextStage}
              disabled={roomState.currentStage >= STAGES.length - 1 || !allScored}
            >
              ➡ Перейти на следующий этап
            </Button>
            <Button size="sm" variant="destructive" onClick={game.finishGame}>
              🏁 Завершить игру
            </Button>
          </div>

          {stage.answerType === 'single-choice' && stage.options && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {stage.options.map((opt) => (
                <div key={opt.id} className="rounded-lg border bg-background px-3 py-2 text-sm font-medium">
                  {opt.label}
                </div>
              ))}
            </div>
          )}

          {stage.answerType === 'slider' && stage.sliderLabels && (
            <div className="rounded-lg border bg-background px-3 py-2 text-sm">
              Формат ответа: {stage.sliderLabels[0]} / {stage.sliderLabels[1]} в процентах.
            </div>
          )}

          {stage.answerType === 'textarea' && (
            <div className="rounded-lg border bg-background px-3 py-2 text-sm">
              Игрок дает текстовый ответ (ведущий заносит его в админском блоке ниже).
            </div>
          )}

          {stage.answerType === 'choice-then-cards' && stage.subChoices && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(stage.subChoices).map(([key, cards]) => (
                <div key={key} className="rounded-lg border bg-background p-2">
                  <p className="text-sm font-semibold mb-1">{key}</p>
                  {cards.map((card) => (
                    <div key={card.id} className="text-xs text-muted-foreground">{card.label}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3) Админский блок-гармошка */}
        <div className="rounded-xl border bg-card p-3 space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setAdminOpen((v) => !v)}
          >
            {adminOpen ? 'Скрыть поле администратора' : 'Открыть поле администратора'}
          </Button>

          {adminOpen && (
            <div className="space-y-3">
              {roomState.players.map((player) => (
                <div key={player.id} className="rounded-xl border bg-background p-3 space-y-3">
                  <PlayerCard
                    player={player}
                    showAnswer
                    showControls
                    currentStage={roomState.currentStage}
                    stageConfig={stage}
                    onAdjustSpeed={(delta) => game.adjustSpeed(player.id, delta)}
                  />

                  <div className="rounded-lg border bg-card p-3 space-y-2">
                    <p className="text-sm font-semibold">Внести ответ игрока</p>

                    {stage.answerType === 'single-choice' && stage.options && (
                      <select
                        className="w-full p-2 rounded border bg-background"
                        value={typeof draftAnswers[player.id] === 'string' ? (draftAnswers[player.id] as string) : ''}
                        onChange={(e) =>
                          setDraftAnswers((prev) => ({ ...prev, [player.id]: e.target.value }))
                        }
                      >
                        <option value="">Выберите ответ</option>
                        {stage.options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {stage.answerType === 'slider' && (
                      <input
                        type="range"
                        min={0}
                        max={100}
                        className="w-full"
                        value={typeof draftAnswers[player.id] === 'number' ? (draftAnswers[player.id] as number) : 50}
                        onChange={(e) =>
                          setDraftAnswers((prev) => ({ ...prev, [player.id]: Number(e.target.value) }))
                        }
                      />
                    )}

                    {stage.answerType === 'textarea' && (
                      <textarea
                        rows={3}
                        className="w-full p-2 rounded border bg-background resize-none"
                        placeholder="Внесите ответ игрока"
                        value={typeof draftAnswers[player.id] === 'string' ? (draftAnswers[player.id] as string) : ''}
                        onChange={(e) =>
                          setDraftAnswers((prev) => ({ ...prev, [player.id]: e.target.value }))
                        }
                      />
                    )}

                    {stage.answerType === 'choice-then-cards' && (
                      <div className="space-y-2">
                        <select
                          className="w-full p-2 rounded border bg-background"
                          value={typeof draftAnswers[player.id] === 'object' && draftAnswers[player.id] !== null ? (draftAnswers[player.id] as { type: string }).type : ''}
                          onChange={(e) =>
                            setDraftAnswers((prev) => ({
                              ...prev,
                              [player.id]: {
                                type: e.target.value,
                                details:
                                  typeof prev[player.id] === 'object' && prev[player.id] !== null
                                    ? (prev[player.id] as { type: string; details: string }).details
                                    : '',
                              },
                            }))
                          }
                        >
                          <option value="">Выберите тип</option>
                          <option value="B2B">B2B</option>
                          <option value="B2C">B2C</option>
                        </select>
                        <textarea
                          rows={3}
                          className="w-full p-2 rounded border bg-background resize-none"
                          placeholder="Кратко внесите параметры ответа"
                          value={typeof draftAnswers[player.id] === 'object' && draftAnswers[player.id] !== null ? (draftAnswers[player.id] as { details: string }).details : ''}
                          onChange={(e) =>
                            setDraftAnswers((prev) => ({
                              ...prev,
                              [player.id]: {
                                type:
                                  typeof prev[player.id] === 'object' && prev[player.id] !== null
                                    ? (prev[player.id] as { type: string; details: string }).type
                                    : '',
                                details: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    )}

                    <Button variant="outline" className="w-full" onClick={() => savePlayerAnswer(player.id)}>
                      Сохранить ответ игрока
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
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
        <div className="w-full mx-auto space-y-6 mt-4">
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

      <div className="w-full mx-auto space-y-4 mt-2">
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
