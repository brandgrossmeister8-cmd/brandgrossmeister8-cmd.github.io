import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BRAND_NAME, GAME_TITLE, STAGES, getInterpretation } from '@/config/stages';
import { getContent, getNumContent } from '@/config/contentStore';
import { Button } from '@/components/ui/button';
import { BrandHeader } from '@/components/game/BrandHeader';
import { motion } from 'framer-motion';

interface StageResult {
  city: string;
  isStrong: boolean;
  now: string;
  after: string;
  step: string;
  lossPercent: number;
}

const getStageLossMap = (): Record<number, number> => ({
  0: getNumContent('calc.loss.0'),
  1: getNumContent('calc.loss.1'),
  2: getNumContent('calc.loss.2'),
  3: getNumContent('calc.loss.3'),
  4: getNumContent('calc.loss.4'),
  5: getNumContent('calc.loss.5'),
});

const getStageData = () => Object.fromEntries(
  [0, 1, 2, 3, 4, 5].map(i => [i, {
    city: getContent(`stage.${i}.cityName`).toUpperCase(),
    nowWeak: getContent(`roadmap.${i}.nowWeak`),
    nowStrong: getContent(`roadmap.${i}.nowStrong`),
    after: getContent(`roadmap.${i}.after`),
    step: getContent(`roadmap.${i}.step`),
  }])
) as Record<number, { city: string; nowWeak: string; nowStrong: string; after: string; step: string }>;

const RoadmapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const STAGE_DATA = getStageData();
  const STAGE_LOSS_MAP = getStageLossMap();
  const { playerName, playerBusiness, speed, deltas, answers, hostTg, hostName } = (location.state || {}) as {
    playerName?: string;
    playerBusiness?: string;
    speed?: number;
    deltas?: Record<number, 10 | -10>;
    answers?: Record<number, unknown>;
    hostTg?: string;
    hostName?: string;
  };

  const [showCalc, setShowCalc] = useState(false);
  const [avgCheck, setAvgCheck] = useState('');
  const [clientsPerMonth, setClientsPerMonth] = useState('');
  const [adBudget, setAdBudget] = useState('');
  const [sellerLevel, setSellerLevel] = useState<'bad' | 'avg' | 'good' | 'super'>('avg');

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

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Потенциал роста — ${playerName}</title>
      <style>
        @page{size:A4;margin:0}*{box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;margin:0;padding:0}
        .page{width:210mm;margin:0 auto;position:relative}
        .header{background:#6838CE;color:white;padding:16px 24px 12px;text-align:center;position:relative}
        .header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:repeating-linear-gradient(90deg,#fff 0px,#fff 8px,#6838CE 8px,#6838CE 16px)}
        .content{padding:12px 24px 16px}
        p{margin:0 0 2px}
        .car{font-size:24px;display:inline-block;transform:scaleX(-1);filter:sepia(1) saturate(5) hue-rotate(-10deg) brightness(1.1)}
      </style></head><body>
      <div class="page">
        <div class="header">
          <p style="font-size:8px;letter-spacing:3px;opacity:0.7">ИМШИНЕЦКАЯ И ПАРТНЕРЫ</p>
          <p style="font-size:18px;font-weight:800;margin:2px 0">БОРТОВОЙ ЖУРНАЛ</p>
          <p style="font-size:12px;opacity:0.8">ПОСЛЕ ВНЕДРЕНИЯ СИСТЕМНОГО ПРОДВИЖЕНИЯ</p>
          <span class="car">🏎️</span>
          <p style="font-size:14px;font-weight:600;margin-top:4px">${playerName}</p>
          <p style="font-size:10px;opacity:0.8">${playerBusiness || ''} | ${today}</p>
          <p style="font-size:9px;opacity:0.6;margin-top:4px">Ведущий: ${hostName || ''}${hostTg ? ' | TG: @' + hostTg : ''}</p>
        </div>
        <div class="content">
          <div style="text-align:center;padding:8px;border-radius:8px;background:#f8f5ff;border:1.5px solid #6838CE40;margin-bottom:10px">
            <p style="font-size:10px;color:#666">Текущая скорость: <strong>${speed} км/ч</strong> → Потенциал: <strong style="color:#166534">120 км/ч</strong></p>
          </div>
          ${stagesHtml}
          ${(() => {
            const check = parseFloat(avgCheck) || 0;
            const clients = parseFloat(clientsPerMonth) || 0;
            const budget = parseFloat(adBudget) || 0;
            if (!check || !clients) return '';
            const r = calcResults();
            const yearTotal = Array.from({ length: 12 }, (_, m) => {
              const mo = m + 1;
              return (mo >= budgetSavingMonth ? r.budgetSaving : 0) + (mo >= trafficGrowthMonth ? (r.lostRevenue + r.revenueFromNewTraffic) : 0);
            }).reduce((a, b) => a + b, 0);
            const scenarios = [
              { label: `Пессимистичный (${getNumContent('calc.scenarioPessimistic')}%)`, val: Math.round(yearTotal * getNumContent('calc.scenarioPessimistic') / 100), color: '#854d0e' },
              { label: `Средневзвешенный (${getNumContent('calc.scenarioBalanced')}%)`, val: Math.round(yearTotal * getNumContent('calc.scenarioBalanced') / 100), color: '#2A168F' },
              { label: `Оптимистичный (${getNumContent('calc.scenarioOptimistic')}%)`, val: Math.round(yearTotal * getNumContent('calc.scenarioOptimistic') / 100), color: '#166534' },
            ];
            const actualRevenue = r.currentRevenue;
            const yearlyEarnings = (actualRevenue * 12) - (budget * 12);
            return '<div style="border:1.5px solid #3b82f6;border-radius:8px;padding:8px 10px;margin-top:8px;background:#eff6ff">' +
              '<p style="font-weight:bold;font-size:10px;color:#1e40af;margin-bottom:4px">ЗАРАБОТОК СЕГОДНЯ ЗА ГОД</p>' +
              '<div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px"><span>Потенциал выручки</span><span>' + new Intl.NumberFormat('ru-RU').format(check * clients * 12) + ' руб</span></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px"><span>Потери из-за зон роста (−' + r.totalLossPercent + '%)</span><span style="color:#dc2626">−' + new Intl.NumberFormat('ru-RU').format(r.lostRevenue * 12) + ' руб</span></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px"><span>Фактическая выручка (' + r.efficiency + '%)</span><span>' + new Intl.NumberFormat('ru-RU').format(actualRevenue * 12) + ' руб</span></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px"><span>Расходы на рекламу за год</span><span style="color:#dc2626">−' + new Intl.NumberFormat('ru-RU').format(budget * 12) + ' руб</span></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:bold;border-top:1px solid #93c5fd;padding-top:3px;margin-top:2px"><span style="color:#1e40af">Заработок за год</span><span style="color:' + (yearlyEarnings >= 0 ? '#1e40af' : '#dc2626') + '">' + (yearlyEarnings >= 0 ? '' : '−') + new Intl.NumberFormat('ru-RU').format(Math.abs(yearlyEarnings)) + ' руб</span></div>' +
              '</div>' +
              '<div style="border:1.5px solid #2A168F;border-radius:8px;padding:8px 10px;margin-top:8px;background:#f8f5ff">' +
              '<p style="font-weight:bold;font-size:10px;color:#2A168F;margin-bottom:6px">ПРОГНОЗ ЗА 12 МЕСЯЦЕВ</p>' +
              '<div style="display:flex;gap:6px">' +
              scenarios.map(s =>
                `<div style="flex:1;text-align:center;padding:6px;border-radius:6px;border:1px solid ${s.color}30;background:white">` +
                `<p style="font-size:8px;color:${s.color};font-weight:bold">${s.label}</p>` +
                `<p style="font-size:14px;font-weight:800;color:${s.color}">+${new Intl.NumberFormat('ru-RU').format(s.val)}</p>` +
                `<p style="font-size:7px;color:#999">руб</p></div>`
              ).join('') +
              '</div>' +
              '<p style="font-size:7px;color:#aaa;text-align:center;margin-top:4px">Не учитываются сезонность, масштабирование, немаркетинговые факторы и прочие форс-мажорные обстоятельства</p>' +
              '</div>';
          })()}
          <div style="text-align:center;margin-top:10px;padding:6px;border-top:1px solid #e5e7eb">
            <p style="font-size:8px;color:#aaa">ИМШИНЕЦКАЯ И ПАРТНЕРЫ | Маркетинговый заезд</p>
            <p style="font-size:7px;color:#ccc">Игра создана на основе авторской технологии системного продвижения Ии Имшинецкой</p>
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
    const i = Number(idx);
    const delta = deltas[i];
    const isStrong = delta === 10;
    return {
      city: data.city,
      isStrong,
      now: isStrong ? data.nowStrong : data.nowWeak,
      after: data.after,
      step: data.step,
      lossPercent: STAGE_LOSS_MAP[i] || 0,
    };
  });

  const weakStages = stages.filter(s => !s.isStrong);
  const strongStages = stages.filter(s => s.isStrong);
  const weakCount = weakStages.length;

  // Мультипликативная модель (McKinsey)
  // Порядок расчёта (от фундамента к тактике):
  //   1. Зачемград (зачем) — 30%
  //   2. Продукто-Брендск (бренд) — 20%
  //   3. Выборг (система/креатив) — 20%
  //   4. Ассортиминск (продукт) — 10%
  //   5. Цалово (ЦА) — 10%
  //   6. Траффик-Сити (каналы) — 10%
  // Каждая зона роста снижает эффективность ОТ ОСТАВШЕГОСЯ
  //
  const CALC_ORDER = [2, 1, 5, 0, 4, 3]; // Зачемград, Продукто-Брендск, Выборг, Ассортиминск, Цалово, Траффик-Сити
  const STAGE_NAMES: Record<number, string> = Object.fromEntries(
    [0, 1, 2, 3, 4, 5].map(i => [i, getContent(`stage.${i}.cityName`)])
  );
  const CONVERSION: Record<string, number> = {
    bad: getNumContent('calc.conversionBad') / 100,
    avg: getNumContent('calc.conversionAvg') / 100,
    good: getNumContent('calc.conversionGood') / 100,
    super: getNumContent('calc.conversionSuper') / 100,
  };
  const budgetSavingMonth = getNumContent('calc.budgetSavingMonth');
  const budgetSavingPercent = getNumContent('calc.budgetSavingPercent') / 100;
  const trafficGrowthMonth = getNumContent('calc.trafficGrowthMonth');
  const trafficGrowthPercentVal = getNumContent('calc.trafficGrowthPercent') / 100;

  const calcResults = () => {
    const check = parseFloat(avgCheck) || 0;
    const clients = parseFloat(clientsPerMonth) || 0;
    const budget = parseFloat(adBudget) || 0;
    const potentialRevenue = check * clients;

    // Мультипликативный расчёт
    let efficiency = 1.0;
    const breakdown: { name: string; loss: number; effBefore: number; effAfter: number }[] = [];

    CALC_ORDER.forEach(idx => {
      if (deltas?.[idx] === -10) {
        const loss = (STAGE_LOSS_MAP[idx] || 0) / 100;
        const before = efficiency;
        efficiency *= (1 - loss);
        breakdown.push({
          name: STAGE_NAMES[idx],
          loss: STAGE_LOSS_MAP[idx],
          effBefore: Math.round(before * 100),
          effAfter: Math.round(efficiency * 100),
        });
      }
    });

    const currentRevenue = potentialRevenue * efficiency;
    const lostRevenue = potentialRevenue - currentRevenue;
    const totalLossPercent = Math.round((1 - efficiency) * 100);

    // Рост трафика
    const trafficGrowth = trafficGrowthPercentVal;
    const conversion = CONVERSION[sellerLevel];
    const newClientsFromTraffic = Math.round(clients * trafficGrowth * conversion);
    const revenueFromNewTraffic = newClientsFromTraffic * check;

    // Экономия бюджета
    const budgetSaving = budget > 0 ? budget * budgetSavingPercent : 0;

    // Помесячный расчёт
    const monthlyGainFull = lostRevenue + revenueFromNewTraffic + budgetSaving;
    const trafficMonths = 12 - trafficGrowthMonth + 1;
    const savingMonths = 12 - budgetSavingMonth + 1;
    const yearlyGain = (lostRevenue * trafficMonths) + (budgetSaving * savingMonths) + (revenueFromNewTraffic * trafficMonths);

    // Заработок сегодня за год: фактическая выручка × 12 − реклама × 12
    const currentYearlyEarnings = (currentRevenue * 12) - (budget * 12);

    return {
      currentRevenue,
      potentialRevenue,
      lostRevenue,
      totalLossPercent,
      efficiency: Math.round(efficiency * 100),
      breakdown,
      trafficGrowth: Math.round(trafficGrowth * 100),
      conversion: Math.round(conversion * 100),
      newClientsFromTraffic,
      revenueFromNewTraffic,
      budgetSaving,
      monthlyGainFull,
      yearlyGain,
      currentYearlyEarnings,
    };
  };

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

  return (
    <div className="min-h-screen bg-background px-2 sm:px-4 py-6">
      <BrandHeader subtitle="ПОТЕНЦИАЛ РОСТА" compact />
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${s.isStrong ? 'text-green-600' : 'text-red-500'}`}>
                    {s.isStrong ? '⬆' : '⬇'}
                  </span>
                  <p className="font-bold">{s.city}</p>
                </div>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${s.isStrong ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {s.isStrong ? `+${s.lossPercent}%` : `−${s.lossPercent}%`}
                </span>
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
                Введите ваши цифры — увидите реальный потенциал роста после внедрения системного продвижения
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Средний чек (руб)</label>
                  <input type="number" value={avgCheck} onChange={(e) => setAvgCheck(e.target.value)} placeholder="5 000" className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Клиентов в месяц</label>
                  <input type="number" value={clientsPerMonth} onChange={(e) => setClientsPerMonth(e.target.value)} placeholder="100" className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Рекламный бюджет/мес (руб)</label>
                  <input type="number" value={adBudget} onChange={(e) => setAdBudget(e.target.value)} placeholder="50 000" className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none mt-1" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-2">Уровень ваших продавцов</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { key: 'bad', label: 'Слабые', desc: 'Конверсия 15%' },
                    { key: 'avg', label: 'Средние', desc: 'Конверсия 30%' },
                    { key: 'good', label: 'Хорошие', desc: 'Конверсия 50%' },
                    { key: 'super', label: 'Отличные', desc: 'Конверсия 70%' },
                  ] as const).map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSellerLevel(opt.key)}
                      className={`rounded-lg border p-2 text-center transition-all ${sellerLevel === opt.key ? 'bg-[#2A168F] border-[#2A168F] text-white' : 'bg-background border-border hover:bg-muted'}`}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className={`text-xs ${sellerLevel === opt.key ? 'text-white/70' : 'text-muted-foreground'}`}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {avgCheck && clientsPerMonth && (() => {
                const r = calcResults();
                return (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                    {/* Заработок сегодня за год */}
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2">
                      <p className="font-bold text-blue-800 text-sm">Ваш заработок сегодня за год</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Потенциал выручки (средний чек × клиенты × 12)</span>
                          <span className="font-mono font-medium">{fmt(r.potentialRevenue * 12)} руб</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Потери из-за зон роста (−{r.totalLossPercent}%)</span>
                          <span className="font-mono font-medium text-red-600">−{fmt(r.lostRevenue * 12)} руб</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Фактическая выручка за год ({r.efficiency}%)</span>
                          <span className="font-mono font-medium">{fmt(r.currentRevenue * 12)} руб</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Расходы на рекламу за год</span>
                          <span className="font-mono font-medium text-red-600">−{fmt(parseFloat(adBudget || '0') * 12)} руб</span>
                        </div>
                        <div className="flex justify-between border-t border-blue-300 pt-2">
                          <span className="font-bold text-blue-800">Заработок за год</span>
                          <span className={`font-mono font-bold text-lg ${(r.currentRevenue * 12 - parseFloat(adBudget || '0') * 12) >= 0 ? 'text-blue-800' : 'text-red-600'}`}>{(r.currentRevenue * 12 - parseFloat(adBudget || '0') * 12) >= 0 ? '' : '−'}{fmt(Math.abs(r.currentRevenue * 12 - parseFloat(adBudget || '0') * 12))} руб</span>
                        </div>
                      </div>
                    </div>

                    {/* Мультипликативная цепочка потерь */}
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
                      <p className="font-bold text-red-800 text-sm">Каскад потерь по зонам роста</p>
                      <p className="text-xs text-red-600">Каждая слабая точка снижает эффективность от оставшегося</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Потенциал</span>
                          <span>100% → {fmt(r.potentialRevenue)} руб/мес</span>
                        </div>
                        {r.breakdown.map((b, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-red-700">{b.name}: −{b.loss}%</span>
                            <span className="font-mono text-red-800 text-xs">{b.effBefore}% → {b.effAfter}%</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold border-t border-red-300 pt-2">
                          <span className="text-red-800">Итого эффективность: {r.efficiency}%</span>
                          <span className="text-red-900">−{fmt(r.lostRevenue)} руб/мес</span>
                        </div>
                      </div>
                    </div>

                    {/* Помесячный прогноз */}
                    <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-3">
                      <p className="font-bold text-green-800 text-sm">Прогноз по месяцам</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-green-300">
                              <th className="text-left py-1.5 pr-2">Месяц</th>
                              <th className="text-right py-1.5 pr-2">Экономия бюджета</th>
                              <th className="text-right py-1.5 pr-2">Рост трафика</th>
                              <th className="text-right py-1.5 font-bold">Итого +</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 12 }, (_, m) => {
                              const month = m + 1;
                              const saving = month >= budgetSavingMonth ? r.budgetSaving : 0;
                              const traffic = month >= trafficGrowthMonth ? (r.lostRevenue + r.revenueFromNewTraffic) : 0;
                              const total = saving + traffic;
                              const isActive = total > 0;
                              return (
                                <tr key={m} className={`border-b border-green-100 ${isActive ? '' : 'text-muted-foreground'}`}>
                                  <td className="py-1 pr-2">{month} мес</td>
                                  <td className="text-right py-1 pr-2">{saving > 0 ? `+${fmt(saving)}` : '—'}</td>
                                  <td className="text-right py-1 pr-2">{traffic > 0 ? `+${fmt(traffic)}` : '—'}</td>
                                  <td className={`text-right py-1 font-bold ${isActive ? 'text-green-700' : ''}`}>{total > 0 ? `+${fmt(total)}` : '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-xs text-green-600 space-y-1">
                        <p>С {budgetSavingMonth}-го месяца — экономия бюджета {Math.round(budgetSavingPercent * 100)}%: <strong>+{fmt(r.budgetSaving)} руб/мес</strong></p>
                        <p>С {trafficGrowthMonth}-го месяца — рост трафика +{r.trafficGrowth}% за счёт системы: <strong>+{fmt(r.lostRevenue + r.revenueFromNewTraffic)} руб/мес</strong></p>
                        <p className="text-muted-foreground">в т.ч. +{r.newClientsFromTraffic} новых клиентов (конверсия продавцов {r.conversion}%)</p>
                      </div>
                    </div>

                    {/* 3 сценария за 12 месяцев */}
                    {(() => {
                      const yearTotal = Array.from({ length: 12 }, (_, m) => {
                        const month = m + 1;
                        return (month >= budgetSavingMonth ? r.budgetSaving : 0) + (month >= trafficGrowthMonth ? (r.lostRevenue + r.revenueFromNewTraffic) : 0);
                      }).reduce((a, b) => a + b, 0);

                      const scenarios = [
                        { label: 'Пессимистичный', pct: getNumContent('calc.scenarioPessimistic'), color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300', bar: 'bg-yellow-400' },
                        { label: 'Средневзвешенный', pct: getNumContent('calc.scenarioBalanced'), color: 'text-[#2A168F]', bg: 'bg-[#f8f5ff]', border: 'border-[#2A168F]', bar: 'bg-[#6838CE]' },
                        { label: 'Оптимистичный', pct: getNumContent('calc.scenarioOptimistic'), color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-400', bar: 'bg-green-500' },
                      ];

                      return (
                        <div className="space-y-4">
                          <p className="text-sm font-bold text-center">3 сценария за 12 месяцев с момента внедрения системы</p>

                          {/* Графики */}
                          <div className="flex items-end gap-3 justify-center h-44">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-bold">{fmt(r.currentRevenue * 12)}</span>
                              <div className="w-14 sm:w-20 rounded-t-lg bg-red-400" style={{ height: '30px' }} />
                              <span className="text-[10px] text-muted-foreground text-center">Сейчас<br/>12 мес</span>
                            </div>
                            {scenarios.map((s, i) => {
                              const val = Math.round(yearTotal * s.pct / 100);
                              const total = r.currentRevenue * 12 + val;
                              return (
                                <div key={i} className="flex flex-col items-center gap-1">
                                  <span className={`text-xs font-bold ${s.color}`}>+{fmt(val)}</span>
                                  <div className={`w-14 sm:w-20 rounded-t-lg ${s.bar}`} style={{ height: `${30 + (s.pct / 100) * 100}px` }} />
                                  <span className="text-[10px] text-muted-foreground text-center">{s.label}<br/>{s.pct}%</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Карточки сценариев */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {scenarios.map((s, i) => {
                              const val = Math.round(yearTotal * s.pct / 100);
                              return (
                                <div key={i} className={`rounded-xl ${s.bg} border ${s.border} p-4 text-center space-y-1`}>
                                  <p className={`text-xs font-bold ${s.color}`}>{s.label} ({s.pct}%)</p>
                                  <p className={`text-2xl font-bold ${s.color}`}>+{fmt(val)}</p>
                                  <p className="text-xs text-muted-foreground">руб за 12 мес</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    <p className="text-[10px] text-muted-foreground text-center">
                      В расчёте не учитываются сезонность, масштабирование, немаркетинговые факторы и прочие форс-мажорные обстоятельства
                    </p>

                    {adBudget === '' || adBudget === '0' ? (
                      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                        У вас нулевой рекламный бюджет. После разработки плана тактических мероприятий будет разработан оптимальный бюджет на реализацию.
                      </div>
                    ) : null}
                  </motion.div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Скачать PDF */}
        <div className="flex justify-center">
          <Button variant="outline" size="lg" onClick={printRoadmapPdf}>
            Скачать PDF — Потенциал роста
          </Button>
        </div>

        {/* Футер с информацией */}
        <div className="rounded-xl bg-muted/50 border p-4 text-center space-y-1 text-sm text-muted-foreground">
          <p>{BRAND_NAME} | {GAME_TITLE}</p>
          <p>Дата игры: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>Ведущий: {hostName || 'не указан'}{hostTg ? <> | TG: <a href={`https://t.me/${hostTg}`} target="_blank" rel="noopener noreferrer" className="text-[#2A168F] font-medium hover:underline">@{hostTg}</a></> : ''}</p>
          <p className="text-xs">Игра создана на основе авторской технологии системного продвижения Ии Имшинецкой</p>
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
