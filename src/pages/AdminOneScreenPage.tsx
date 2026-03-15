import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { BrandHeader } from '@/components/game/BrandHeader';
import { RaceTrack } from '@/components/game/RaceTrack';
import { TimerDisplay } from '@/components/game/TimerDisplay';
import { PlayerCard } from '@/components/game/PlayerCard';
import { Button } from '@/components/ui/button';
import { STAGES, getInterpretation } from '@/config/stages';
import { ChevronDown, ChevronUp } from 'lucide-react';

type ChoiceDraft = { type: string; details?: string; fields?: Record<string, string> };
type Draft = string | number | ChoiceDraft | null;

/** Collapsible section with arrow toggle */
function CollapsibleBlock({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <h2 className="font-bold text-lg">{title}</h2>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

const AdminOneScreenPage = () => {
  const navigate = useNavigate();
  const game = useGame();
  const { roomState } = game;
  const [showJournalBlock, setShowJournalBlock] = useState(true);
  const [showQuestionBlock, setShowQuestionBlock] = useState(true);
  const [showLeaderBlock, setShowLeaderBlock] = useState(true);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, Draft>>({});
  const [stageSliderPreview, setStageSliderPreview] = useState(50);
  const [previewAudienceType, setPreviewAudienceType] = useState<string>('');
  const [selectedCardLabel, setSelectedCardLabel] = useState<string>('');
  const [savedPlayers, setSavedPlayers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPreviewAudienceType('');
    setDraftAnswers({});
    setSelectedCardLabel('');
    setSavedPlayers({});
  }, [roomState?.currentStage]);

  if (!roomState) return <div className="min-h-screen flex items-center justify-center bg-background">Загрузка...</div>;

  const finalCardTone = (speed: number) => {
    if (speed > 100) return 'bg-green-100 text-green-950 border-green-400';
    if (speed > 60) return 'bg-yellow-100 text-yellow-950 border-yellow-400';
    if (speed === 60) return 'bg-white text-black border-border';
    return 'bg-red-100 text-red-950 border-red-400';
  };

  if (roomState.phase === 'final') {
    const sorted = [...roomState.players].sort((a, b) => b.speed - a.speed);
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <BrandHeader subtitle="ИТОГИ ИГРЫ" compact />
        <div className="w-full mx-auto mt-4 space-y-4">
          <RaceTrack players={sorted} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sorted.map((p) => (
              <div key={p.id} className={`rounded-xl border p-4 ${finalCardTone(p.speed)}`}>
                <p className="font-bold">{p.name}</p>
                <p className="text-sm opacity-80">{p.business}</p>
                <p className="text-2xl font-bold mt-2">{p.speed} км/ч</p>
                <p className="text-xs opacity-80 italic">{getInterpretation(p.speed)}</p>
              </div>
            ))}
          </div>
          <Button variant="hero" className="w-full" onClick={() => { game.restartGame(); navigate('/'); }}>Начать новую игру</Button>
        </div>
      </div>
    );
  }

  const stage = roomState.currentStage >= 0 ? STAGES[roomState.currentStage] : null;
  if (!stage) return <div className="min-h-screen flex items-center justify-center bg-background">Нет активного этапа</div>;

  const saveAnswer = (playerId: string) => {
    const v = draftAnswers[playerId];
    if (v === null || v === undefined || v === '') return;
    let answer: unknown = v;
    if (stage.answerType === 'choice-then-cards') {
      const data = v as ChoiceDraft;
      if (!data.type) return;
      const params = data.fields && Object.keys(data.fields).length > 0
        ? data.fields
        : { summary: data.details || '' };
      answer = { type: data.type, params };
    }
    game.adminSetPlayerAnswer(playerId, roomState.currentStage, answer);
    setSavedPlayers(prev => ({ ...prev, [playerId]: true }));
  };

  const explainCard = (label: string) => {
    const t = label.toLowerCase();
    if (t.includes('товар')) return 'Товар — это конкретный физический или цифровой продукт, который клиент получает в измеримом виде. Примеры: одежда, электроника, программное обеспечение. Ключевое отличие — клиент может его потрогать, измерить, сравнить с аналогами.';
    if (t.includes('услуга')) return 'Услуга — это действие или работа, которую вы выполняете для клиента. Примеры: консалтинг, ремонт, обучение. Особенность — результат неотделим от процесса, клиент оценивает качество в момент получения.';
    if (t.includes('информация')) return 'Информация — это знания, методики, данные или контент, который клиент применяет самостоятельно. Примеры: курсы, аналитические отчёты, базы данных. Ценность — в уникальности и применимости знаний.';
    if (t.includes('технолог')) return 'Технология — это воспроизводимый процесс с понятными шагами и предсказуемым результатом. Примеры: франшиза, лицензия на метод, SaaS-платформа. Клиент покупает не продукт, а способ достижения результата.';
    if (t.includes('сервис')) return 'Сервис — это сопровождение и удобство использования основного предложения. Примеры: техподдержка, доставка, гарантийное обслуживание. Сервис повышает ценность основного продукта и формирует лояльность.';
    if (t.includes('сырье')) return 'Сырье — это базовый материал или компонент, из которого создаётся конечный продукт. Примеры: ткани для пошива, ингредиенты для производства, заготовки. Конкурентное преимущество — в качестве, стабильности поставок и цене.';
    if (t.includes('зовем всех')) return 'Массовая стратегия охвата: широкий поток, но ниже точность попадания в целевую аудиторию. Большие бюджеты на рекламу, высокая стоимость привлечения одного клиента.';
    if (t.includes('приходят сами')) return 'Пассивная стратегия: зависимость от сарафанного радио и случайного входящего потока. Низкие затраты, но непредсказуемый результат и сложность масштабирования.';
    if (t.includes('только тех')) return 'Целевая стратегия: фокус на клиентах, которым продукт нужен прямо сейчас. Точный таргетинг, высокая конверсия, оптимальное использование бюджета.';
    return 'Этот вариант отражает один из рабочих подходов в текущем этапе маркетинговой стратегии.';
  };

  return (
    <div className="min-h-screen bg-background px-4 py-4">
      <BrandHeader subtitle={`ЭТАП ${roomState.currentStage + 1}. ГОРОД ${stage.cityName.toUpperCase()}`} compact />
      <div className="w-full mx-auto mt-3 space-y-4">

        {/* БЛОК 1: Бортовой журнал */}
        <CollapsibleBlock title="БОРТОВОЙ ЖУРНАЛ" open={showJournalBlock} onToggle={() => setShowJournalBlock(v => !v)}>
          <div className="flex flex-wrap items-center gap-3">
            <TimerDisplay remaining={roomState.timer.remaining} total={roomState.timer.total} running={roomState.timer.running} className="min-w-[170px]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {!roomState.timer.running && <Button size="sm" variant="success" onClick={() => game.timerControl('start')}>▶ Включить таймер</Button>}
            {roomState.timer.running && <Button size="sm" variant="outline" onClick={() => game.timerControl('pause')}>⏸ Пауза</Button>}
            <Button size="sm" variant="outline" onClick={() => game.timerControl('restart')}>🔄 Сброс</Button>
            <Button size="sm" variant="success" onClick={game.nextStage} disabled={roomState.currentStage >= STAGES.length - 1}>
              ➡ Следующий этап
            </Button>
            <Button size="sm" variant="destructive" onClick={game.finishGame}>🏁 Завершить игру</Button>
          </div>
          <RaceTrack players={roomState.players} compact />
        </CollapsibleBlock>

        {/* БЛОК 2: Город + вопрос + карточки */}
        <CollapsibleBlock title={stage.cityName.toUpperCase()} open={showQuestionBlock} onToggle={() => setShowQuestionBlock(v => !v)}>
          <p className="text-sm font-medium">{stage.question}</p>

          {stage.answerType === 'single-choice' && stage.options && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {stage.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedCardLabel(prev => prev === opt.label ? '' : opt.label)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium text-left transition-all ${
                    selectedCardLabel === opt.label
                      ? 'bg-[#2A168F] border-[#2A168F] text-white scale-[1.02] shadow-lg'
                      : 'bg-[#F3E8FF] border-[#D8B4FE] hover:bg-[#E9D8FD]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {stage.answerType === 'slider' && stage.sliderLabels && (
            <div className="rounded-lg border bg-background px-3 py-3 space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{stage.sliderLabels[0]}: {stageSliderPreview}%</span>
                <span>{stage.sliderLabels[1]}: {100 - stageSliderPreview}%</span>
              </div>
              <input type="range" min={0} max={100} value={stageSliderPreview} onChange={(e) => setStageSliderPreview(Number(e.target.value))} className="w-full" />
            </div>
          )}

          {stage.answerType === 'textarea' && (
            <div className="rounded-lg border bg-background px-3 py-2 text-sm">
              Введите ответ
            </div>
          )}

          {stage.answerType === 'choice-then-cards' && stage.subChoices && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button size="sm" variant={previewAudienceType === 'B2B' ? 'default' : 'outline'} onClick={() => setPreviewAudienceType('B2B')}>B2B</Button>
                <Button size="sm" variant={previewAudienceType === 'B2C' ? 'default' : 'outline'} onClick={() => setPreviewAudienceType('B2C')}>B2C</Button>
              </div>
              {previewAudienceType && stage.subChoices[previewAudienceType] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {stage.subChoices[previewAudienceType].map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedCardLabel(prev => prev === card.label ? '' : card.label)}
                      className={`rounded-lg border p-2 text-xs text-left transition-all ${
                        selectedCardLabel === card.label
                          ? 'bg-[#2A168F] border-[#2A168F] text-white scale-[1.02] shadow-lg'
                          : 'bg-[#F3E8FF] border-[#D8B4FE] text-muted-foreground hover:bg-[#E9D8FD]'
                      }`}
                    >
                      {card.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedCardLabel && stage.answerType !== 'slider' && (
            <div className="rounded-lg border border-[#2A168F]/30 bg-[#FAF5FF] px-4 py-3 text-sm animate-in fade-in duration-200">
              <span className="font-semibold text-[#2A168F]">{selectedCardLabel}:</span>
              <p className="mt-1 text-muted-foreground">{explainCard(selectedCardLabel)}</p>
            </div>
          )}
        </CollapsibleBlock>

        {/* БЛОК 3: Поле ведущего */}
        <CollapsibleBlock title="ПИТ-СТОП" open={showLeaderBlock} onToggle={() => setShowLeaderBlock(v => !v)}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {roomState.players.map((player) => (
              <div key={player.id} className="rounded-xl border bg-background p-3 space-y-3">
                <PlayerCard
                  player={player}
                  showAnswer
                  showControls
                  showIdentityLabels
                  isSaved={!!savedPlayers[player.id]}
                  currentStage={roomState.currentStage}
                  stageConfig={stage}
                  onAdjustSpeed={(delta) => game.adjustSpeed(player.id, delta)}
                />

                <div className="rounded-lg border bg-card p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Ввод ответа ведущим игры (необязательно)</p>
                  {stage.answerType === 'single-choice' && stage.options && (
                    <select className="w-full p-2 rounded border bg-background" value={typeof draftAnswers[player.id] === 'string' ? (draftAnswers[player.id] as string) : ''} onChange={(e) => setDraftAnswers((p) => ({ ...p, [player.id]: e.target.value }))}>
                      <option value="">Выберите ответ</option>
                      {stage.options.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                    </select>
                  )}
                  {stage.answerType === 'slider' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>{stage.sliderLabels?.[0] ?? 'Левая шкала'}: {typeof draftAnswers[player.id] === 'number' ? (draftAnswers[player.id] as number) : 50}%</span>
                        <span>{stage.sliderLabels?.[1] ?? 'Правая шкала'}: {100 - (typeof draftAnswers[player.id] === 'number' ? (draftAnswers[player.id] as number) : 50)}%</span>
                      </div>
                      <input type="range" min={0} max={100} className="w-full" value={typeof draftAnswers[player.id] === 'number' ? (draftAnswers[player.id] as number) : 50} onChange={(e) => setDraftAnswers((p) => ({ ...p, [player.id]: Number(e.target.value) }))} />
                    </div>
                  )}
                  {stage.answerType === 'textarea' && (
                    <textarea rows={3} className="w-full p-2 rounded border bg-background resize-none" placeholder="Внесите ответ игрока" value={typeof draftAnswers[player.id] === 'string' ? (draftAnswers[player.id] as string) : ''} onChange={(e) => setDraftAnswers((p) => ({ ...p, [player.id]: e.target.value }))} />
                  )}
                  {stage.answerType === 'choice-then-cards' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={typeof draftAnswers[player.id] === 'object' && draftAnswers[player.id] !== null && (draftAnswers[player.id] as ChoiceDraft).type === 'B2B' ? 'default' : 'outline'}
                          onClick={() =>
                            setDraftAnswers((p) => {
                              const prev = p[player.id] as ChoiceDraft | null;
                              return { ...p, [player.id]: { type: 'B2B', fields: prev?.fields || {} } };
                            })
                          }
                        >
                          B2B
                        </Button>
                        <Button
                          size="sm"
                          variant={typeof draftAnswers[player.id] === 'object' && draftAnswers[player.id] !== null && (draftAnswers[player.id] as ChoiceDraft).type === 'B2C' ? 'default' : 'outline'}
                          onClick={() =>
                            setDraftAnswers((p) => {
                              const prev = p[player.id] as ChoiceDraft | null;
                              return { ...p, [player.id]: { type: 'B2C', fields: prev?.fields || {} } };
                            })
                          }
                        >
                          B2C
                        </Button>
                      </div>
                      {typeof draftAnswers[player.id] === 'object' &&
                        draftAnswers[player.id] !== null &&
                        (draftAnswers[player.id] as ChoiceDraft).type &&
                        stage.subChoices?.[(draftAnswers[player.id] as ChoiceDraft).type] && (
                          <div className="space-y-2">
                            {stage.subChoices[(draftAnswers[player.id] as ChoiceDraft).type].map((card) => (
                              <div key={card.id} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground shrink-0 w-1/3">{card.label}</span>
                                <input
                                  className="flex-1 p-2 rounded border bg-background text-sm"
                                  placeholder="Ответ..."
                                  value={(draftAnswers[player.id] as ChoiceDraft).fields?.[card.id] || ''}
                                  onChange={(e) =>
                                    setDraftAnswers((p) => {
                                      const prev = (p[player.id] as ChoiceDraft) || { type: '', fields: {} };
                                      return { ...p, [player.id]: { type: prev.type, fields: { ...(prev.fields || {}), [card.id]: e.target.value } } };
                                    })
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                  {savedPlayers[player.id] ? (
                    <Button variant="outline" className="w-full opacity-60 cursor-default" disabled>Ответ сохранён</Button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => saveAnswer(player.id)}>Сохранить ответ игрока</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleBlock>
      </div>
    </div>
  );
};

export default AdminOneScreenPage;
