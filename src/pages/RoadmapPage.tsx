import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BRAND_NAME, GAME_TITLE, STAGES, getInterpretation } from '@/config/stages';
import { Button } from '@/components/ui/button';
import { BrandHeader } from '@/components/game/BrandHeader';
import { motion } from 'framer-motion';

interface StageResult {
  city: string;
  isStrong: boolean;
  now: string;
  after: string;
  step: string;
}

const STAGE_DATA: Record<number, { city: string; nowWeak: string; nowStrong: string; after: string; step: string }> = {
  0: {
    city: 'АССОРТИМИНСК',
    nowWeak: 'Вы не до конца понимаете, что продаёте. Без этого понимания невозможно выстроить эффективное продвижение.',
    nowStrong: 'Вы понимаете свой продукт. Это одна из точек, но сама по себе она не создаёт систему — система складывается из всех элементов вместе.',
    after: 'Когда понимание продукта встроено в систему продвижения, каждый элемент коммуникации работает на конкретный тип продукта. Клиенты сразу понимают, что вы предлагаете.',
    step: 'Определите тип вашего продукта и выстройте коммуникацию под его специфику.',
  },
  1: {
    city: 'ПРОДУКТО-БРЕНДСК',
    nowWeak: 'Вы продвигаете отдельные позиции. Каждый новый продукт требует нового бюджета с нуля.',
    nowStrong: 'Вы понимаете ценность бренда. Это важная точка, но без системы бренд работает не на полную мощность.',
    after: 'В системе бренд работает как зонтик: любой новый продукт стартует не с нуля, а с уровня доверия. Экономия бюджета на запуск новых направлений до 60%.',
    step: 'Переведите фокус с продвижения отдельных товаров на продвижение бренда.',
  },
  2: {
    city: 'ЗАЧЕМГРАД',
    nowWeak: 'Вы не можете чётко объяснить, зачем клиенту ваш продукт. Коммуникация размыта.',
    nowStrong: 'Вы понимаете, зачем клиент покупает. Но это понимание становится по-настоящему эффективным только внутри системы.',
    after: 'В системе каждое сообщение, пост, разговор с клиентом строится вокруг его реальной потребности. Конверсия из обращения в покупку вырастает кратно.',
    step: 'Сформулируйте 3 главных «зачем» ваших клиентов и используйте их во всех коммуникациях.',
  },
  3: {
    city: 'ТРАФФИК-СИТИ',
    nowWeak: 'Бюджеты расходуются неэффективно — привлекаете не тех или всех подряд.',
    nowStrong: 'Вы привлекаете нужную аудиторию. Но без системы даже правильный трафик не конвертируется в полную силу.',
    after: 'В системе стоимость привлечения клиента снижается на 30-50%. Каждый рубль бюджета приводит целевого клиента, а не случайного посетителя.',
    step: 'Откажитесь от массовой рекламы. Настройте привлечение только тех, кому продукт нужен сейчас.',
  },
  4: {
    city: 'ЦАЛОВО',
    nowWeak: 'Вы плохо знаете свою ЦА. Коммуникации нацелены в пустоту.',
    nowStrong: 'Вы знаете свою ЦА. Это сильная точка, но знание ЦА раскрывается полностью только когда все элементы системы работают вместе.',
    after: 'В системе вы говорите на языке клиента, решаете его конкретную проблему. Клиент чувствует: «Это для меня». Лояльность и повторные покупки растут.',
    step: 'Составьте детальный портрет ЦА: кто, зачем, как принимает решение, что для него важно.',
  },
  5: {
    city: 'ВЫБОРГ',
    nowWeak: 'Вы делаете ставку на креатив — разовые вспышки без долгосрочного эффекта.',
    nowStrong: 'Вы понимаете роль системности. Но одно понимание — это ещё не работающая система. Система заставляет весь механизм работать эффективно.',
    after: 'В работающей системе бизнес предсказуем. Клиенты приходят системно, а не от случая к случаю. Вы можете планировать рост, потому что понимаете, откуда придут клиенты завтра.',
    step: 'Выстройте систему регулярных точек контакта с клиентом. Креатив — дополнение, не основа.',
  },
};

const RoadmapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerName, playerBusiness, speed, deltas, answers, hostTg } = (location.state || {}) as {
    playerName?: string;
    playerBusiness?: string;
    speed?: number;
    deltas?: Record<number, 10 | -10>;
    answers?: Record<number, unknown>;
    hostTg?: string;
  };

  const [showCalc, setShowCalc] = useState(false);
  const [avgCheck, setAvgCheck] = useState('');
  const [clientsPerMonth, setClientsPerMonth] = useState('');
  const [adBudget, setAdBudget] = useState('');

  const formatAnswer = (answer: unknown, stageIdx: number): string => {
    if (!answer) return '';
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

  const printRoadmapPdf = () => {
    const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const stagesHtml = Object.entries(STAGE_DATA).map(([idx, data]) => {
      const i = Number(idx);
      const delta = deltas?.[i];
      const isStrong = delta === 10;
      const ans = answers ? formatAnswer(answers[i], i) : '';
      return `
        <div style="border:1.5px solid ${isStrong ? '#22c55e' : '#ef4444'};border-radius:8px;padding:8px 10px;margin-bottom:8px;background:${isStrong ? '#f0fdf4' : '#fef2f2'}">
          <p style="font-weight:bold;font-size:11px;color:${isStrong ? '#166534' : '#991b1b'};margin-bottom:3px">${isStrong ? '⬆' : '⬇'} ${data.city}</p>
          ${ans ? `<p style="font-size:10px;color:#333;margin-bottom:3px;background:#fff;padding:3px 6px;border-radius:4px">Ваш ответ: ${ans}</p>` : ''}
          <div style="display:flex;gap:8px">
            <div style="flex:1">
              <p style="font-size:9px;font-weight:bold;color:#666;margin-bottom:1px">СЕЙЧАС</p>
              <p style="font-size:10px">${isStrong ? data.nowStrong : data.nowWeak}</p>
            </div>
            <div style="flex:1">
              <p style="font-size:9px;font-weight:bold;color:#2A168F;margin-bottom:1px">ПОСЛЕ ВНЕДРЕНИЯ</p>
              <p style="font-size:10px">${data.after}</p>
            </div>
          </div>
        </div>`;
    }).join('');

    const weakSteps = Object.entries(STAGE_DATA)
      .filter(([idx]) => deltas?.[Number(idx)] === -10)
      .map(([, data], i) => `<p style="font-size:10px;margin-bottom:3px"><strong>${i + 1}. ${data.city}:</strong> ${data.step}</p>`)
      .join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Дорожная карта — ${playerName}</title>
      <style>
        @page{size:A4;margin:0}*{box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;margin:0;padding:0}
        .page{width:210mm;margin:0 auto;position:relative}
        .header{background:#6838CE;color:white;padding:16px 24px 12px;text-align:center;position:relative}
        .header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:repeating-linear-gradient(90deg,#fff 0px,#fff 8px,#6838CE 8px,#6838CE 16px)}
        .content{padding:12px 24px 16px}
        p{margin:0 0 2px}
        .car{font-size:24px;display:inline-block;transform:scaleX(-1);filter:sepia(1) saturate(5) hue-rotate(10deg) brightness(1.1)}
      </style></head><body>
      <div class="page">
        <div class="header">
          <p style="font-size:8px;letter-spacing:3px;opacity:0.7">ИМШИНЕЦКАЯ И ПАРТНЕРЫ</p>
          <p style="font-size:18px;font-weight:800;margin:2px 0">БОРТОВОЙ ЖУРНАЛ</p>
          <p style="font-size:12px;opacity:0.8">ПОСЛЕ ВНЕДРЕНИЯ СИСТЕМНОГО ПРОДВИЖЕНИЯ</p>
          <span class="car">🏎️</span>
          <p style="font-size:14px;font-weight:600;margin-top:4px">${playerName}</p>
          <p style="font-size:10px;opacity:0.8">${playerBusiness || ''} | ${today}</p>
        </div>
        <div class="content">
          <div style="text-align:center;padding:8px;border-radius:8px;background:#f8f5ff;border:1.5px solid #6838CE40;margin-bottom:10px">
            <p style="font-size:10px;color:#666">Текущая скорость: <strong>${speed} км/ч</strong> → Потенциал: <strong style="color:#166534">120 км/ч</strong></p>
          </div>
          ${stagesHtml}
          ${weakSteps ? `<div style="border:1.5px solid #2A168F;border-radius:8px;padding:8px 10px;background:#f8f5ff;margin-top:8px">
            <p style="font-weight:bold;font-size:11px;color:#2A168F;margin-bottom:4px">ПРИОРИТЕТНЫЕ ШАГИ</p>
            ${weakSteps}
          </div>` : ''}
          <div style="text-align:center;margin-top:10px;padding:6px;border-top:1px solid #e5e7eb">
            <p style="font-size:8px;color:#aaa">ИМШИНЕЦКАЯ И ПАРТНЕРЫ | Маркетинговый заезд | ${hostTg ? 'Ведущий: @' + hostTg : ''}</p>
          </div>
        </div>
      </div></body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    const htmlWithButton = html.replace('</body>', `
      <div style="position:fixed;top:16px;right:16px;display:flex;gap:8px;z-index:100" class="no-print">
        <button onclick="window.print()" style="padding:10px 20px;background:#6838CE;color:white;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer">Сохранить PDF</button>
        <button onclick="window.close()" style="padding:10px 20px;background:#e5e7eb;color:#333;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer">Вернуться</button>
      </div>
      <style>@media print{.no-print{display:none!important}}</style></body>`);
    win.document.write(htmlWithButton);
    win.document.close();
  };

  if (!playerName || !deltas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Нет данных. Вернитесь к итогам игры.</p>
      </div>
    );
  }

  const stages: StageResult[] = Object.entries(STAGE_DATA).map(([idx, data]) => {
    const delta = deltas[Number(idx)];
    const isStrong = delta === 10;
    return {
      city: data.city,
      isStrong,
      now: isStrong ? data.nowStrong : data.nowWeak,
      after: data.after,
      step: data.step,
    };
  });

  const weakStages = stages.filter(s => !s.isStrong);
  const strongStages = stages.filter(s => s.isStrong);
  const weakCount = weakStages.length;

  // Калькулятор
  const calcResults = () => {
    const check = parseFloat(avgCheck) || 0;
    const clients = parseFloat(clientsPerMonth) || 0;
    const budget = parseFloat(adBudget) || 0;
    const currentRevenue = check * clients;

    // Каждая зона роста = ~12% потерь эффективности
    const lossPercent = weakCount * 12;
    const potentialRevenue = currentRevenue * (1 + lossPercent / 100);
    const savedBudget = budget * (weakCount * 0.08); // 8% экономии на каждую зону
    const monthlyGain = (potentialRevenue - currentRevenue) + savedBudget;
    const yearlyGain = monthlyGain * 12;

    return { currentRevenue, potentialRevenue, savedBudget, monthlyGain, yearlyGain, lossPercent };
  };

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

  return (
    <div className="min-h-screen bg-background px-2 sm:px-4 py-6">
      <BrandHeader subtitle="ДОРОЖНАЯ КАРТА" compact />
      <div className="max-w-3xl mx-auto mt-4 space-y-6">

        {/* Заголовок */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">{playerName}</h2>
          <p className="text-muted-foreground">{playerBusiness}</p>
          <p className="text-lg">Финальная скорость: <strong>{speed} км/ч</strong></p>
        </div>

        {/* Сравнение: Сейчас / После */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#2A168F]">Ваш бизнес: сейчас и после внедрения</h3>

          {stages.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className={`text-lg ${s.isStrong ? 'text-green-600' : 'text-red-500'}`}>
                  {s.isStrong ? '⬆' : '⬇'}
                </span>
                <p className="font-bold">{s.city}</p>
              </div>

              {answers?.[i] && (
                <div className="rounded-lg p-2 bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">Ваш ответ: <span className="font-medium text-foreground">{formatAnswer(answers[i], i)}</span></p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`rounded-lg p-3 ${s.isStrong ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-xs font-bold mb-1 text-muted-foreground">СЕЙЧАС</p>
                  <p className="text-sm">{s.now}</p>
                </div>
                <div className="rounded-lg p-3 bg-[#f0ecff] border border-[#2A168F]/20">
                  <p className="text-xs font-bold mb-1 text-[#2A168F]">ПОСЛЕ ВНЕДРЕНИЯ</p>
                  <p className="text-sm">{s.after}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Приоритетные шаги */}
        {weakStages.length > 0 && (
          <div className="rounded-xl border-2 border-[#2A168F] bg-[#f8f5ff] p-6 space-y-4">
            <h3 className="text-xl font-bold text-[#2A168F]">Ваши приоритетные шаги</h3>
            <p className="text-sm text-muted-foreground">Начните с самого критичного — результат будет заметен сразу</p>
            <div className="space-y-3">
              {weakStages.map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-[#2A168F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{s.city}</p>
                    <p className="text-sm text-muted-foreground">{s.step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Калькулятор */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <button
            onClick={() => setShowCalc(!showCalc)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-xl font-bold text-[#2A168F]">Калькулятор упущенной выгоды</h3>
            <span className="text-muted-foreground">{showCalc ? '▲' : '▼'}</span>
          </button>

          {showCalc && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Введите ваши цифры — увидите, сколько вы недополучаете без системного продвижения
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Средний чек (руб)</label>
                  <input
                    type="number"
                    value={avgCheck}
                    onChange={(e) => setAvgCheck(e.target.value)}
                    placeholder="5 000"
                    className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Клиентов в месяц</label>
                  <input
                    type="number"
                    value={clientsPerMonth}
                    onChange={(e) => setClientsPerMonth(e.target.value)}
                    placeholder="100"
                    className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Рекламный бюджет/мес (руб)</label>
                  <input
                    type="number"
                    value={adBudget}
                    onChange={(e) => setAdBudget(e.target.value)}
                    placeholder="50 000"
                    className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none mt-1"
                  />
                </div>
              </div>

              {avgCheck && clientsPerMonth && (() => {
                const r = calcResults();
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl bg-[#f8f5ff] border-2 border-[#2A168F] p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-white border">
                        <p className="text-xs text-muted-foreground">Ваша выручка сейчас</p>
                        <p className="text-2xl font-bold">{fmt(r.currentRevenue)} руб/мес</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50 border border-green-300">
                        <p className="text-xs text-green-700">С системным продвижением</p>
                        <p className="text-2xl font-bold text-green-700">{fmt(r.potentialRevenue)} руб/мес</p>
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <p className="text-sm">У вас <strong>{weakCount} из 6</strong> зон роста — потеря <strong>{r.lossPercent}%</strong> эффективности</p>
                      {r.savedBudget > 0 && (
                        <p className="text-sm">Оптимизация бюджета: <strong>−{fmt(r.savedBudget)} руб/мес</strong></p>
                      )}
                    </div>

                    {/* Визуальный график */}
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-center">Сравнение выручки</p>
                      <div className="flex items-end gap-4 justify-center h-40">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold">{fmt(r.currentRevenue)}</span>
                          <div
                            className="w-16 sm:w-24 rounded-t-lg bg-red-400 transition-all"
                            style={{ height: `${Math.max((r.currentRevenue / r.potentialRevenue) * 120, 20)}px` }}
                          />
                          <span className="text-xs text-muted-foreground">Сейчас</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-green-700">{fmt(r.potentialRevenue)}</span>
                          <div
                            className="w-16 sm:w-24 rounded-t-lg bg-green-500 transition-all"
                            style={{ height: '120px' }}
                          />
                          <span className="text-xs text-muted-foreground">С системой</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-[#2A168F]">{fmt(r.monthlyGain)}</span>
                          <div
                            className="w-16 sm:w-24 rounded-t-lg bg-[#6838CE] transition-all"
                            style={{ height: `${Math.max(((r.potentialRevenue - r.currentRevenue) / r.potentialRevenue) * 120, 10)}px` }}
                          />
                          <span className="text-xs text-muted-foreground">Разница</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center p-4 rounded-xl bg-red-50 border border-red-300">
                      <p className="text-sm text-red-800">Вы недополучаете каждый месяц</p>
                      <p className="text-3xl font-bold text-red-700">{fmt(r.monthlyGain)} руб</p>
                      <p className="text-lg font-bold text-red-600 mt-1">За год: {fmt(r.yearlyGain)} руб</p>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Скачать PDF */}
        <div className="flex justify-center">
          <Button variant="outline" size="lg" onClick={printRoadmapPdf}>
            Скачать PDF — Бортовой журнал после внедрения
          </Button>
        </div>

        {/* Футер с информацией */}
        <div className="rounded-xl bg-muted/50 border p-4 text-center space-y-1 text-sm text-muted-foreground">
          <p>{BRAND_NAME} | {GAME_TITLE}</p>
          <p>Дата игры: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>Ведущий: {hostTg ? <a href={`https://t.me/${hostTg}`} target="_blank" rel="noopener noreferrer" className="text-[#2A168F] font-medium hover:underline">@{hostTg}</a> : 'не указан'}</p>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Вернуться к итогам
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
