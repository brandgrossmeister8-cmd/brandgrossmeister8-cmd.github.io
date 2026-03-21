import { StageConfig, SpeedInterpretation } from '@/types/game';
import { getContent } from '@/config/contentStore';

export const STAGES: StageConfig[] = [
  {
    index: 0,
    title: 'Этап 1',
    get cityName() { return getContent('stage.0.cityName'); },
    timerSeconds: 60,
    get question() { return getContent('stage.0.question'); },
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
    get cityName() { return getContent('stage.1.cityName'); },
    timerSeconds: 30,
    get question() { return getContent('stage.1.question'); },
    answerType: 'slider',
    sliderLabels: ['Бренд', 'Ассортимент'],
  },
  {
    index: 2,
    title: 'Этап 3',
    get cityName() { return getContent('stage.2.cityName'); },
    timerSeconds: 180,
    get question() { return getContent('stage.2.question'); },
    answerType: 'textarea',
    get placeholder() { return getContent('stage.2.placeholder'); },
  },
  {
    index: 3,
    title: 'Этап 4',
    get cityName() { return getContent('stage.3.cityName'); },
    timerSeconds: 30,
    get question() { return getContent('stage.3.question'); },
    answerType: 'single-choice',
    options: [
      { id: 'Зовем всех', label: 'Зовем всех' },
      { id: 'Клиенты приходят сами', label: 'Клиенты приходят сами' },
      { id: 'Зовем только тех, кто нужен', label: 'Зовем только тех, кого нужен' },
    ],
  },
  {
    index: 4,
    title: 'Этап 5',
    get cityName() { return getContent('stage.4.cityName'); },
    timerSeconds: 180,
    get question() { return getContent('stage.4.question'); },
    answerType: 'choice-then-cards',
    subChoices: {
      B2B: [
        { id: 'why-business', label: 'Зачем для бизнеса', editable: true },
        { id: 'industry', label: 'Отрасль', editable: true },
        { id: 'business-size', label: 'Размер бизнеса', editable: true },
        { id: 'relationship', label: 'Форма взаимоотношений (долгосрочно или разово)', editable: true },
        { id: 'decision-maker', label: 'Лицо принимающее решение (ЛПР)', editable: true },
        { id: 'personal-why', label: 'Личный зачем ЛПР', editable: true },
        { id: 'b2b-custom-1', label: 'Свой параметр 1', editable: true, customTitle: true },
        { id: 'b2b-custom-2', label: 'Свой параметр 2', editable: true, customTitle: true },
      ],
      B2C: [
        { id: 'why', label: 'Зачем', editable: true },
        { id: 'behavior', label: 'Модель поведения (рациональная или эмоциональная)', editable: true },
        { id: 'family', label: 'Семья', editable: true },
        { id: 'children', label: 'Дети', editable: true },
        { id: 'location', label: 'Горожане или сельские', editable: true },
        { id: 'age', label: 'Возраст', editable: true },
        { id: 'gender', label: 'Пол', editable: true },
        { id: 'economy', label: 'Экономическое положение', editable: true },
        { id: 'motive', label: 'Мотив', editable: true },
        { id: 'b2c-custom-1', label: 'Свой параметр 1', editable: true, customTitle: true },
        { id: 'b2c-custom-2', label: 'Свой параметр 2', editable: true, customTitle: true },
      ],
    },
    subChoiceHints: {
      B2B: 'Заполните 8 параметров',
      B2C: 'Заполните 11 параметров',
    },
  },
  {
    index: 5,
    title: 'Этап 6',
    get cityName() { return getContent('stage.5.cityName'); },
    timerSeconds: 30,
    get question() { return getContent('stage.5.question'); },
    answerType: 'slider',
    sliderLabels: ['Системность', 'Креативность'],
  },
];

export const SPEED_INTERPRETATIONS: SpeedInterpretation[] = [
  { speed: 0, get text() { return getContent('speed.0'); } },
  { speed: 30, get text() { return getContent('speed.30'); } },
  { speed: 60, get text() { return getContent('speed.60'); } },
  { speed: 90, get text() { return getContent('speed.90'); } },
  { speed: 120, get text() { return getContent('speed.120'); } },
];

export function getInterpretation(speed: number): string {
  if (speed <= 0) return getContent('speed.0');
  if (speed >= 120) return getContent('speed.120');

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
export const BRAND_NAME = getContent('global.brandName');
export const GAME_TITLE = getContent('global.gameTitle');
export const ONE_SCREEN_MODE = true;
