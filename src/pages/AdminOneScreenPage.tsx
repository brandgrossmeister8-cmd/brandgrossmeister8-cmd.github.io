import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { isAuthorized, getSavedCode, getHostName, getCurrentHostTelegram } from '@/config/accessCodes';
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

  useEffect(() => {
    if (!isAuthorized()) navigate('/access', { replace: true });
  }, [navigate]);
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

  const [hiddenPlayers, setHiddenPlayers] = useState<Record<string, boolean>>({});
  const [printingPlayer, setPrintingPlayer] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState<string | null>(null);
  const [notAllScoredWarning, setNotAllScoredWarning] = useState(false);

  const stageRecommendations: Record<number, { city: string; strong: string; weak: string }> = {
    0: {
      city: 'АССОРТИМИНСК',
      strong: 'Вы хорошо понимаете, что вы продаёте, а значит ваша программа продвижения выстроена системно, в соответствии с продвигаемым продуктом.',
      weak: 'Вы не до конца понимаете, что вы продаёте. Соответственно, ваша система продвижения не может быть выстроена эффективно.',
    },
    1: {
      city: 'ПРОДУКТО-БРЕНДСК',
      strong: 'Вы правильно выбрали приоритеты — не фокусируетесь на отдельных позициях, а продвигаете бренд.',
      weak: 'Вы фокусируетесь на отдельных продуктах, тем самым нерационально используете бюджет. При добавлении каждой новой позиции вам придётся всё начинать заново.',
    },
    2: {
      city: 'ЗАЧЕМГРАД',
      strong: 'Вы чётко понимаете, зачем ваши клиенты покупают ваш продукт, и можете вести с ними эффективную коммуникацию.',
      weak: 'Вам необходимо чётко определить, зачем ваши клиенты у вас покупают, чтобы выстроить эффективную коммуникацию.',
    },
    3: {
      city: 'ТРАФФИК-СИТИ',
      strong: 'Вы эффективно вкладываете бюджеты в продвижение и привлекаете нужную аудиторию.',
      weak: 'Вы неэффективно вкладываете бюджеты в привлечение аудитории — привлекаете не тех, кого нужно, либо зовёте всех. Ваши бюджеты расходуются неэффективно.',
    },
    4: {
      city: 'ЦАЛОВО',
      strong: 'Вы хорошо изучили свою целевую аудиторию. Это ваш сильный плюс — вы эффективно взаимодействуете с аудиторией.',
      weak: 'Вы плохо знаете свою целевую аудиторию. Все ваши коммуникации нацелены не на эффективное взаимодействие, а в большей степени способствуют трате бюджета.',
    },
    5: {
      city: 'ВЫБОРГ',
      strong: 'Вы чётко понимаете, что система — это основа, а креатив — дополнение. Двигайтесь в этом направлении!',
      weak: 'Креатив — это хорошо, но это всего лишь эффект в точке, здесь и сейчас. Эффект на длинной дистанции даёт только система.',
    },
  };

  const getPlayerResults = (deltas: Record<number, 10 | -10> | undefined) => {
    if (!deltas) return { strong: [] as { city: string; text: string }[], weak: [] as { city: string; text: string }[] };
    const strong: { city: string; text: string }[] = [];
    const weak: { city: string; text: string }[] = [];
    Object.entries(deltas).forEach(([stageIdx, delta]) => {
      const rec = stageRecommendations[Number(stageIdx)];
      if (!rec) return;
      if (delta === 10) strong.push({ city: rec.city, text: rec.strong });
      else weak.push({ city: rec.city, text: rec.weak });
    });
    return { strong, weak };
  };

  const togglePlayerVisibility = (id: string) => {
    setHiddenPlayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const savedHostCode = getSavedCode();
  const hostDisplayName = savedHostCode === 'MASTER'
    ? (localStorage.getItem('game-host-display-name') || 'Ведущий')
    : savedHostCode ? getHostName(savedHostCode) : 'Ведущий';

  const formatAnswerText = (answer: unknown, stageIdx: number): string => {
    if (answer === undefined || answer === null) return '';
    if (typeof answer === 'string') return answer;
    if (typeof answer === 'number') {
      const s = STAGES[stageIdx];
      if (s?.sliderLabels) return `${s.sliderLabels[0]}: ${answer}% / ${s.sliderLabels[1]}: ${100 - answer}%`;
      return `${answer}%`;
    }
    if (typeof answer === 'object') {
      const obj = answer as Record<string, unknown>;
      if (obj.type) {
        const params = (obj.params || obj.fields) as Record<string, string> | undefined;
        if (params) {
          const lines = Object.entries(params).filter(([,v]) => v && String(v).trim()).map(([,v]) => String(v));
          return `${obj.type}: ${lines.join(', ')}`;
        }
        return String(obj.type);
      }
    }
    return String(answer);
  };

  const generatePlayerPdfHtml = (player: { name: string; business?: string; speed: number; answers: Record<number, unknown>; lastSpeedDelta?: Record<number, 10 | -10> }) => {
    const { strong, weak } = getPlayerResults(player.lastSpeedDelta);
    const strongHtml = strong.length > 0 ? `
      <div style="border:1.5px solid #22c55e;border-radius:8px;padding:10px 12px;margin-bottom:10px;background:#f0fdf4">
        <p style="font-weight:bold;color:#166534;margin-bottom:6px;font-size:12px">&#x2B06; СИЛЬНЫЕ СТОРОНЫ</p>
        ${strong.map(item => `<p style="margin:0 0 1px"><span style="font-size:11px;font-weight:bold;color:#14532d">${item.city}:</span> <span style="font-size:11px;color:#166534">${item.text}</span></p>`).join('')}
      </div>` : '';
    const weakHtml = weak.length > 0 ? `
      <div style="border:1.5px solid #ef4444;border-radius:8px;padding:10px 12px;background:#fef2f2">
        <p style="font-weight:bold;color:#991b1b;margin-bottom:6px;font-size:12px">&#x2B07; ЗОНЫ РОСТА</p>
        ${weak.map(item => `<p style="margin:0 0 1px"><span style="font-size:11px;font-weight:bold;color:#7f1d1d">${item.city}:</span> <span style="font-size:11px;color:#991b1b">${item.text}</span></p>`).join('')}
      </div>` : '';

    const speedColor = player.speed > 100 ? '#166534' : player.speed > 60 ? '#854d0e' : player.speed === 60 ? '#000' : '#991b1b';
    const speedBg = player.speed > 100 ? '#f0fdf4' : player.speed > 60 ? '#fefce8' : player.speed === 60 ? '#fff' : '#fef2f2';

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Бортовой журнал — ${player.name}</title>
      <style>
        @page{size:A4;margin:0}
        *{box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;margin:0;padding:0}
        .page{width:210mm;height:297mm;margin:0 auto;position:relative;overflow:hidden;display:flex;flex-direction:column}
        .header{background:#6838CE;color:white;padding:20px 30px 16px;text-align:center;position:relative;flex-shrink:0}
        .header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:repeating-linear-gradient(90deg,#fff 0px,#fff 8px,#6838CE 8px,#6838CE 16px)}
        .content{padding:16px 30px 20px;flex:1;display:flex;flex-direction:column}
        .speed-block{text-align:center;padding:14px;border-radius:12px;background:${speedBg};border:1.5px solid ${speedColor}40;margin-bottom:14px}
        .car{font-size:28px;display:inline-block;transform:scaleX(-1);filter:sepia(1) saturate(5) hue-rotate(10deg) brightness(1.1)}
        .footer{margin-top:auto;text-align:center;padding-top:12px;border-top:1px solid #e5e7eb}
        p{margin:0 0 3px}
      </style>
      </head><body>
      <div class="page">
        <div class="header">
          <p style="font-size:9px;letter-spacing:3px;opacity:0.7;margin-bottom:4px">ИМШИНЕЦКАЯ И ПАРТНЕРЫ</p>
          <p style="font-size:22px;font-weight:800;margin:0">БОРТОВОЙ ЖУРНАЛ</p>
          <span class="car">🏎️</span>
          <p style="font-size:16px;font-weight:600;margin-top:4px">${player.name}</p>
          <p style="font-size:12px;opacity:0.8">${player.business || ''}</p>
          <p style="font-size:10px;opacity:0.6;margin-top:8px">${today} | Ведущий: ${hostDisplayName}</p>
        </div>
        <div class="content">
          <div class="speed-block">
            <p style="font-size:11px;color:#666">Финальная скорость</p>
            <p style="font-size:40px;font-weight:800;color:${speedColor};line-height:1.1">${player.speed} км/ч</p>
            <p style="font-size:11px;color:#666;font-style:italic">${getInterpretation(player.speed)}</p>
          </div>
          <div style="margin-bottom:10px">
            <p style="font-weight:bold;font-size:12px;margin-bottom:6px">ОТВЕТЫ ИГРОКА</p>
            ${STAGES.map((s, i) => {
              const ans = formatAnswerText(player.answers[i], i);
              const delta = player.lastSpeedDelta?.[i];
              const color = delta === 10 ? '#166534' : delta === -10 ? '#991b1b' : '#666';
              const bg = delta === 10 ? '#f0fdf4' : delta === -10 ? '#fef2f2' : '#f9fafb';
              return ans ? `<div style="padding:4px 8px;border-radius:6px;background:${bg};margin-bottom:4px;border:1px solid ${color}20">
                <span style="font-size:10px;font-weight:bold;color:${color}">${s.cityName.toUpperCase()}:</span>
                <span style="font-size:10px;color:#333"> ${ans}</span>
                ${delta ? `<span style="font-size:9px;color:${color}"> (${delta > 0 ? '+' : ''}${delta} км/ч)</span>` : ''}
              </div>` : '';
            }).join('')}
          </div>
          ${strongHtml}${weakHtml}
          <div class="footer">
            <p style="font-size:9px;color:#aaa">ИМШИНЕЦКАЯ И ПАРТНЕРЫ | Маркетинговый заезд</p>
          </div>
        </div>
      </div>
      </body></html>`;
  };

  const downloadPlayerPdf = (player: { name: string; business?: string; speed: number; answers: Record<number, unknown>; lastSpeedDelta?: Record<number, 10 | -10> }) => {
    const html = generatePlayerPdfHtml(player);
    // Добавляем кнопку "Вернуться" в HTML
    const htmlWithButton = html.replace('</body>', `
      <div style="position:fixed;top:16px;right:16px;display:flex;gap:8px;z-index:100" class="no-print">
        <button onclick="window.print()" style="padding:10px 20px;background:#6838CE;color:white;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer">Сохранить PDF</button>
        <button onclick="window.close()" style="padding:10px 20px;background:#e5e7eb;color:#333;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer">Вернуться к итогам</button>
      </div>
      <style>@media print{.no-print{display:none!important}}</style>
      </body>`);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(htmlWithButton);
    win.document.close();
  };

  const sharePlayerPdf = async (player: { name: string; business?: string; speed: number; email?: string; lastSpeedDelta?: Record<number, 10 | -10> }) => {
    const html = generatePlayerPdfHtml(player);
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], `Бортовой журнал — ${player.name}.html`, { type: 'text/html' });

    // Пробуем встроенную функцию "Поделиться"
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Бортовой журнал — ${player.name}`,
          text: `Результаты игры "Маркетинговый заезд". Финальная скорость: ${player.speed} км/ч`,
          files: [file],
        });
        return;
      } catch { /* пользователь отменил */ }
    }

    // Запасной вариант — скачиваем файл + копируем email
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Бортовой журнал — ${player.name}.html`;
    a.click();
    URL.revokeObjectURL(url);

    if (player.email) {
      await navigator.clipboard.writeText(player.email);
      setEmailCopied(player.email);
      setTimeout(() => setEmailCopied(null), 5000);
    }
  };

  if (roomState.phase === 'final') {
    const sorted = [...roomState.players].sort((a, b) => b.speed - a.speed);

    return (
      <div className="min-h-screen bg-background px-2 sm:px-4 py-4 sm:py-6">
        {/* Печатная версия одного игрока */}
        {printingPlayer && (() => {
          const pp = sorted.find(p => p.id === printingPlayer);
          if (!pp) return null;
          const { strong: ps, weak: pw } = getPlayerResults(pp.lastSpeedDelta);
          return (
            <div className="hidden print:block print:p-6">
              <style>{`@media print { .no-print { display: none !important; } @page { size: A4; margin: 15mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
              <h1 className="text-2xl font-bold text-center mb-1">БОРТОВОЙ ЖУРНАЛ</h1>
              <p className="text-center text-lg font-medium">{pp.name} — {pp.business}</p>
              <p className="text-center text-3xl font-bold mt-4">{pp.speed} км/ч</p>
              <p className="text-center text-sm italic mb-6">{getInterpretation(pp.speed)}</p>
              {ps.length > 0 && (
                <div className="border-2 border-green-400 rounded-lg p-4 mb-4 bg-green-50">
                  <p className="font-bold text-green-800 mb-2">&#x2B06; Сильные стороны</p>
                  {ps.map((item, i) => <div key={i} className="mb-2"><p className="text-sm font-bold">{item.city}</p><p className="text-sm">{item.text}</p></div>)}
                </div>
              )}
              {pw.length > 0 && (
                <div className="border-2 border-red-400 rounded-lg p-4 bg-red-50">
                  <p className="font-bold text-red-800 mb-2">&#x2B07; Зоны роста</p>
                  {pw.map((item, i) => <div key={i} className="mb-2"><p className="text-sm font-bold">{item.city}</p><p className="text-sm">{item.text}</p></div>)}
                </div>
              )}
              <p className="text-center text-xs mt-8 text-gray-400">ИМШИНЕЦКАЯ И ПАРТНЕРЫ | Маркетинговый заезд</p>
            </div>
          );
        })()}

        <div className={printingPlayer ? 'no-print' : ''}>
          <BrandHeader subtitle="ИТОГИ ИГРЫ" compact />
          <div className="w-full mx-auto mt-4 space-y-4">
            <RaceTrack players={sorted} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sorted.map((p) => {
                const { strong, weak } = getPlayerResults(p.lastSpeedDelta);
                const hidden = hiddenPlayers[p.id];
                return (
                  <div key={p.id} className={`rounded-xl border p-4 space-y-3 ${finalCardTone(p.speed)}`}>
                    {/* Заголовок с кнопкой скрытия */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-60">БОРТОВОЙ ЖУРНАЛ</p>
                        <p className="font-bold text-lg">{p.name} <span className="font-normal text-sm opacity-70">— {p.business}</span></p>
                      </div>
                      <button
                        onClick={() => togglePlayerVisibility(p.id)}
                        className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                        title={hidden ? 'Показать' : 'Скрыть'}
                      >
                        {hidden ? '👁' : '👁‍🗨'}
                      </button>
                    </div>

                    {!hidden && (
                      <>
                        <div>
                          <p className="text-3xl font-bold mt-1">{p.speed} км/ч</p>
                          <p className="text-xs opacity-80 italic">{getInterpretation(p.speed)}</p>
                        </div>
                        {strong.length > 0 && (
                          <div className="rounded-lg bg-green-100 border border-green-300 p-3 space-y-3">
                            <p className="font-bold text-green-800 flex items-center gap-1">
                              <span className="text-lg">&#x2B06;</span> Сильные стороны
                            </p>
                            {strong.map((item, i) => (
                              <div key={i}>
                                <p className="text-sm font-bold text-green-900">{item.city}</p>
                                <p className="text-sm text-green-800">{item.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {weak.length > 0 && (
                          <div className="rounded-lg bg-red-100 border border-red-300 p-3 space-y-3">
                            <p className="font-bold text-red-800 flex items-center gap-1">
                              <span className="text-lg">&#x2B07;</span> Зоны роста
                            </p>
                            {weak.map((item, i) => (
                              <div key={i}>
                                <p className="text-sm font-bold text-red-900">{item.city}</p>
                                <p className="text-sm text-red-800">{item.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {strong.length === 0 && weak.length === 0 && (
                          <p className="text-xs opacity-60 italic">Нет данных по этапам</p>
                        )}

                        {/* Кнопки действий */}
                        <div className="flex gap-2 pt-2 border-t border-border/30">
                          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadPlayerPdf(p)}>
                            Скачать PDF
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs bg-[#2A168F] text-white hover:bg-[#2A168F]/90"
                            onClick={() => navigate('/roadmap', { state: {
                              playerName: p.name,
                              playerBusiness: p.business,
                              speed: p.speed,
                              deltas: p.lastSpeedDelta || {},
                              answers: p.answers || {},
                              hostTg: getCurrentHostTelegram(),
                            }})}
                          >
                            Увидеть потенциал
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <Button variant="hero" className="w-full" onClick={() => { game.restartGame(); navigate('/'); }}>Начать новую игру</Button>
          </div>
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
    if (t.includes('товар')) return 'Товар — физическая вещь, которую можно взять, потрогать, унести.';
    if (t.includes('услуга')) return 'Услуга — работа с ответственностью за результат.';
    if (t.includes('информация')) return 'Информация — передача данных или знаний без ответственности за результат.';
    if (t.includes('технолог')) return 'Технология — упакованные знания и опыт, которые работают без участия автора.';
    if (t.includes('сервис')) return 'Сервис — повторяющийся процесс, который делается одинаково для каждого клиента.';
    if (t.includes('сырье')) return 'Сырье — продают все и везде, ноунейм. Покупатель выбирает только по цене.';
    if (t.includes('зовем всех')) return 'Массовая стратегия охвата: широкий поток, но ниже точность попадания в целевую аудиторию. Большие бюджеты на рекламу, высокая стоимость привлечения одного клиента.';
    if (t.includes('приходят сами')) return 'Пассивная стратегия: зависимость от сарафанного радио и случайного входящего потока. Низкие затраты, но непредсказуемый результат и сложность масштабирования.';
    if (t.includes('только тех')) return 'Целевая стратегия: фокус на клиентах, которым продукт нужен прямо сейчас. Точный таргетинг, высокая конверсия, оптимальное использование бюджета.';
    return 'Этот вариант отражает один из рабочих подходов в текущем этапе маркетинговой стратегии.';
  };

  return (
    <div className="min-h-screen bg-background px-2 sm:px-4 py-2 sm:py-4">
      <BrandHeader subtitle={`ЭТАП ${roomState.currentStage + 1}. ГОРОД ${stage.cityName.toUpperCase()}`} compact />
      <div className="w-full mx-auto mt-2 sm:mt-3 space-y-3 sm:space-y-4">

        {/* БЛОК 1: Бортовой журнал */}
        <CollapsibleBlock title="БОРТОВОЙ ЖУРНАЛ" open={showJournalBlock} onToggle={() => setShowJournalBlock(v => !v)}>
          <div className="flex flex-wrap items-center gap-3">
            <TimerDisplay remaining={roomState.timer.remaining} total={roomState.timer.total} running={roomState.timer.running} className="min-w-[170px]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {!roomState.timer.running && <Button size="sm" variant="success" onClick={() => game.timerControl('start')}>▶ Включить таймер</Button>}
            {roomState.timer.running && <Button size="sm" variant="outline" onClick={() => game.timerControl('pause')}>⏸ Пауза</Button>}
            <Button size="sm" variant="outline" onClick={() => game.timerControl('restart')}>🔄 Сброс</Button>
            <Button size="sm" variant="success" disabled={roomState.currentStage >= STAGES.length - 1} onClick={() => {
              const allScored = roomState.players.every(p => p.lastSpeedDelta?.[roomState.currentStage] !== undefined);
              if (!allScored) { setNotAllScoredWarning(true); setTimeout(() => setNotAllScoredWarning(false), 4000); return; }
              game.nextStage();
            }}>
              ➡ Следующий этап
            </Button>
            <Button size="sm" variant="destructive" onClick={() => {
              const allScored = roomState.players.every(p => p.lastSpeedDelta?.[roomState.currentStage] !== undefined);
              if (!allScored) { setNotAllScoredWarning(true); setTimeout(() => setNotAllScoredWarning(false), 4000); return; }
              game.finishGame();
            }}>🏁 Завершить игру</Button>
          </div>
          {notAllScoredWarning && (
            <div className="rounded-lg bg-red-100 border border-red-300 px-4 py-2 text-sm text-red-800 font-medium animate-in fade-in">
              Не все игроки оценены на этом этапе. Поставьте оценку каждому игроку в блоке ПИТ-СТОП.
            </div>
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
