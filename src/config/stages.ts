import { StageConfig, SpeedInterpretation } from '@/types/game';

export const STAGES: StageConfig[] = [
  {
    index: 0,
    title: 'Этап 1',
    cityName: 'Ассортиминск',
    timerSeconds: 60,
    question: 'Выберите основной тип вашего продукта:',
    answerType: 'single-choice',
    options: [
      { id: 'Товар', label: 'Товар' },
      { id: 'Услуга', label: 'Услуга' },
      { id: 'Информация', label: 'Информация' },
      { id: 'Технология', label: 'Технология' },
      { id: 'Сервис', label: 'Сервис' },
      { id: 'Сырье', label: 'Сырье' },
    ],
  },
  {
    index: 1,
    title: 'Этап 2',
    cityName: 'Брендск',
    timerSeconds: 60,
    question: 'Распределите 100% между Брендом и Ассортиментом:',
    answerType: 'slider',
    sliderLabels: ['Бренд', 'Ассортимент'],
  },
  {
    index: 2,
    title: 'Этап 3',
    cityName: 'Зачемград',
    timerSeconds: 180,
    question: 'Зачем клиенты покупают ваш продукт?',
    answerType: 'textarea',
    placeholder: 'Опишите подробно, зачем клиенты покупают ваш продукт...',
  },
  {
    index: 3,
    title: 'Этап 4',
    cityName: 'Траффик-Сити',
    timerSeconds: 60,
    question: 'Как вы привлекаете клиентов?',
    answerType: 'single-choice',
    options: [
      { id: 'Зовем всех', label: 'Зовем всех' },
      { id: 'Клиенты приходят сами', label: 'Клиенты приходят сами' },
      { id: 'Зовем только тех, кто нужен', label: 'Зовем только тех, кто нужен' },
    ],
  },
  {
    index: 4,
    title: 'Этап 5',
    cityName: 'Цалово',
    timerSeconds: 120,
    question: 'Выберите тип клиента и заполните параметры целевой аудитории:',
    answerType: 'choice-then-cards',
    subChoices: {
      B2B: [
        { id: 'market', label: 'Рынок В2В', editable: true },
        { id: 'why-business', label: 'Зачем для бизнеса', editable: true },
        { id: 'industry', label: 'Отрасль', editable: true },
        { id: 'business-size', label: 'Размер бизнеса', editable: true },
        { id: 'relationship', label: 'Форма взаимоотношений (долгосрочно или разово)', editable: true },
        { id: 'decision-maker', label: 'Лицо принимающее решение (ЛПР)', editable: true },
        { id: 'personal-why', label: 'Личный зачем ЛПР', editable: true },
      ],
      B2C: [
        { id: 'market', label: 'Рынок В2С', editable: true },
        { id: 'why', label: 'Зачем', editable: true },
        { id: 'behavior', label: 'Модель поведения (рациональная или эмоциональная)', editable: true },
        { id: 'family', label: 'Семья', editable: true },
        { id: 'children', label: 'Дети', editable: true },
        { id: 'location', label: 'Горожане или сельские', editable: true },
        { id: 'age', label: 'Возраст', editable: true },
        { id: 'gender', label: 'Пол', editable: true },
        { id: 'economy', label: 'Экономическое положение', editable: true },
        { id: 'motive', label: 'Мотив', editable: true },
      ],
    },
    subChoiceHints: {
      B2B: 'Заполните 7 параметров',
      B2C: 'Заполните 10 параметров',
    },
  },
  {
    index: 5,
    title: 'Этап 6',
    cityName: 'Выборг',
    timerSeconds: 60,
    question: 'Распределите 100% между Системностью и Креативностью:',
    answerType: 'slider',
    sliderLabels: ['Системность', 'Креативность'],
  },
];

export const SPEED_INTERPRETATIONS: SpeedInterpretation[] = [
  { speed: 0, text: 'Работа вхолостую, ресурсы тратятся зря' },
  { speed: 30, text: 'Движение есть, но бизнес на грани остановки' },
  { speed: 60, text: 'Базовый уровень, стагнация' },
  { speed: 90, text: 'Хороший прогресс, но эффективность ресурсов лишь 50%' },
  { speed: 120, text: 'Идеально выстроенная система маркетинга' },
];

export function getInterpretation(speed: number): string {
  if (speed <= 0) return SPEED_INTERPRETATIONS[0].text;
  if (speed >= 120) return SPEED_INTERPRETATIONS[4].text;
  
  const sorted = [...SPEED_INTERPRETATIONS].sort((a, b) => a.speed - b.speed);
  let closest = sorted[0];
  let minDiff = Math.abs(speed - closest.speed);
  
  for (const interp of sorted) {
    const diff = Math.abs(speed - interp.speed);
    if (diff < minDiff) {
      minDiff = diff;
      closest = interp;
    }
  }
  
  return closest.text;
}

export const INITIAL_SPEED = 60;
export const SPEED_DELTA = 10;
export const MAX_PLAYERS = 6;
export const BRAND_NAME = 'ИМШИНЕЦКАЯ И ПАРТНЕРЫ';
export const GAME_TITLE = 'Маркетинговый заезд';
export const ONE_SCREEN_MODE = true;
