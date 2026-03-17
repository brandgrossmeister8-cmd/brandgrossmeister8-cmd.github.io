import { useNavigate } from 'react-router-dom';
import { BRAND_NAME } from '@/config/stages';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const InstructionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: '#A977FA' }}>{BRAND_NAME}</h1>
          <h2 className="text-3xl font-bold mt-2">Инструкция для ведущего</h2>
        </div>

        {/* Подготовка */}
        <section className="space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg text-[#2A168F]">1. Подготовка к игре</h4>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>Получите от администратора <strong>код доступа</strong> или <strong>ссылку для входа</strong></li>
              <li>Скачайте и распечатайте <strong>Бортовой журнал игрока</strong> — раздайте каждому участнику перед игрой. В журнале все вопросы этапов и поля для записей</li>
            </ol>
            <Button variant="hero" className="w-full bg-[#2A168F] hover:bg-[#2A168F]/90 text-white" onClick={() => navigate('/journal')}>
              Скачать Бортовой журнал игрока (PDF)
            </Button>
            <ol start={3} className="list-decimal list-inside space-y-3 text-sm">
              <li>Данные игроков <strong>не собираются и не хранятся</strong> — всё удаляется после окончания игры</li>
            </ol>
          </div>

          {/* Вход */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg text-[#2A168F]">2. Вход в игру</h4>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>Откройте сайт и нажмите <strong>«Включить зажигание»</strong></li>
              <li>Введите <strong>ваше имя</strong> и <strong>код доступа</strong>, нажмите «Войти»</li>
              <li>Код запоминается в браузере — при следующем входе вводить не нужно</li>
            </ol>
          </div>

          {/* Регистрация */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg text-[#2A168F]">3. Регистрация игроков</h4>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>На странице <strong>«Правила»</strong> ознакомьте участников с правилами, нажмите «Далее»</li>
              <li>Введите <strong>имя</strong> и <strong>бизнес</strong> каждого участника</li>
              <li>Можно добавить <strong>до 6 игроков</strong></li>
              <li>Нажмите <strong>«Включить зажигание»</strong></li>
            </ol>
          </div>

          {/* Игровой экран */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg text-[#2A168F]">4. Игровой экран — 3 сворачиваемых блока</h4>
            <p className="text-sm text-muted-foreground">Каждый блок можно свернуть/развернуть стрелочкой</p>

            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="font-bold text-[#2A168F]">БОРТОВОЙ ЖУРНАЛ</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li><strong>Таймер</strong> — включайте, ставьте на паузу, сбрасывайте</li>
                  <li><strong>Следующий этап</strong> — переход к следующему городу</li>
                  <li><strong>Завершить игру</strong> — переход к итогам</li>
                  <li><strong>Гоночная трасса</strong> — позиции игроков в реальном времени</li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="font-bold text-[#2A168F]">ГОРОД (название этапа)</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Показывает <strong>вопрос</strong> текущего этапа</li>
                  <li>Нажмите на <strong>карточку варианта</strong> — появится подробное описание</li>
                  <li>Для этапов со слайдером — интерактивная шкала</li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="font-bold text-[#2A168F]">ПИТ-СТОП</p>
                <p className="text-sm text-muted-foreground mb-2">Алгоритм работы с каждым игроком:</p>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Внесите ответ игрока и нажмите <strong>«Сохранить ответ игрока»</strong></li>
                  <li>Кнопка меняется на <strong>«Ответ сохранён»</strong>, статус — <strong>«Ответ принят»</strong></li>
                  <li>Оцените ответ: <strong>+10 км/ч</strong> (хороший) или <strong>-10 км/ч</strong> (слабый)</li>
                  <li>Статус меняется на <strong>«Оценка выполнена»</strong></li>
                </ol>
              </div>
            </div>
          </div>

          {/* Этапы */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg text-[#2A168F]">5. Шесть этапов игры</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Этап</th>
                    <th className="text-left py-2 pr-4">Город</th>
                    <th className="text-left py-2 pr-4">Время</th>
                    <th className="text-left py-2">Задание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">1</td>
                    <td className="py-2 pr-4 font-medium">Ассортиминск</td>
                    <td className="py-2 pr-4">1 мин</td>
                    <td className="py-2">Выберите тип продукта (Товар, Услуга, Информация, Технология, Сервис, Сырье)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">2</td>
                    <td className="py-2 pr-4 font-medium">Продукто-Брендск</td>
                    <td className="py-2 pr-4">30 сек</td>
                    <td className="py-2">Распределите 100% между Брендом и Ассортиментом</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">3</td>
                    <td className="py-2 pr-4 font-medium">Зачемград</td>
                    <td className="py-2 pr-4">3 мин</td>
                    <td className="py-2">Расскажите, зачем людям ваш продукт? (текстовый ответ)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">4</td>
                    <td className="py-2 pr-4 font-medium">Траффик-Сити</td>
                    <td className="py-2 pr-4">30 сек</td>
                    <td className="py-2">Как привлекаете клиентов? (Зовём всех / Приходят сами / Только нужных)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">5</td>
                    <td className="py-2 pr-4 font-medium">Цалово</td>
                    <td className="py-2 pr-4">3 мин</td>
                    <td className="py-2">Выбор B2B или B2C, заполнение параметров целевой аудитории</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">6</td>
                    <td className="py-2 pr-4 font-medium">Выборг</td>
                    <td className="py-2 pr-4">30 сек</td>
                    <td className="py-2">Распределите 100% между Системностью и Креативностью</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Итоги */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg text-[#2A168F]">6. Итоги игры</h4>
            <p className="text-sm">После нажатия <strong>«Завершить игру»</strong> открывается финальный экран:</p>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li><strong>Гоночная трасса</strong> с финальными позициями</li>
              <li><strong>Бортовой журнал каждого игрока</strong> с результатами:
                <div className="ml-6 mt-1 space-y-1">
                  <p>Финальная скорость с цветовой шкалой:
                    <span className="inline-block ml-2 px-2 py-0.5 rounded bg-red-100 text-red-900 text-xs font-medium">&lt;60</span>
                    <span className="inline-block ml-1 px-2 py-0.5 rounded bg-white border text-black text-xs font-medium">60</span>
                    <span className="inline-block ml-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 text-xs font-medium">61–100</span>
                    <span className="inline-block ml-1 px-2 py-0.5 rounded bg-green-100 text-green-900 text-xs font-medium">&gt;100</span>
                  </p>
                  <p><span className="text-green-700 font-bold">⬆</span> <strong>Сильные стороны</strong> — этапы, где скорость увеличилась, с рекомендациями</p>
                  <p><span className="text-red-700 font-bold">⬇</span> <strong>Зоны роста</strong> — этапы, где скорость упала, с рекомендациями</p>
                </div>
              </li>
              <li>Можно <strong>скрыть/показать</strong> карточку каждого игрока (иконка глаза)</li>
              <li><strong>«Скачать PDF»</strong> — бортовой журнал с ответами и рекомендациями</li>
              <li><strong>«Увидеть потенциал»</strong> — персональный потенциал роста игрока (см. ниже)</li>
              <li><strong>«Начать новую игру»</strong> — возврат на главную страницу</li>
              <li>Переход к следующему этапу или завершение игры невозможны, пока <strong>не оценены все игроки</strong></li>
            </ul>
          </div>

          {/* Потенциал роста */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg text-[#2A168F]">7. Потенциал роста</h4>
            <p className="text-sm">Для каждого игрока можно открыть персональный потенциал роста:</p>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li><strong>Сравнение «Сейчас / После внедрения»</strong> по всем 6 этапам с ответами игрока</li>
              <li><strong>Калькулятор упущенной выгоды</strong> — игрок вводит свои цифры:
                <div className="ml-6 mt-1 space-y-1">
                  <p>Средний чек, количество клиентов, рекламный бюджет</p>
                  <p>Уровень продавцов (слабые 15% / средние 30% / хорошие 50% / отличные 70%)</p>
                </div>
              </li>
              <li><strong>Мультипликативная модель потерь</strong> — каждая зона роста снижает эффективность от оставшегося (каскадный расчёт):
                <div className="ml-6 mt-1 space-y-1 text-xs text-muted-foreground">
                  <p>Порядок расчёта (от фундамента к тактике):</p>
                  <p>1. Выборг −20% → 2. Зачемград −30% → 3. Продукто-Брендск −20%</p>
                  <p>4. Цалово −10% → 5. Ассортиминск −10% → 6. Траффик-Сити −10%</p>
                  <p className="mt-1">Пример: при 3 зонах роста бизнес работает на ~50% потенциала, при 6 — на ~33%</p>
                </div>
              </li>
              <li><strong>Прогноз после внедрения:</strong>
                <div className="ml-6 mt-1 space-y-1 text-xs text-muted-foreground">
                  <p>С 3-го месяца — экономия бюджета 30%</p>
                  <p>С 8-го месяца — рост трафика +40% за счёт выстроенной системы</p>
                </div>
              </li>
              <li><strong>3 сценария за 12 месяцев</strong> с момента внедрения:
                <div className="ml-6 mt-1 space-y-1 text-xs text-muted-foreground">
                  <p>Пессимистичный — 40% от потенциала</p>
                  <p>Средневзвешенный — 70% от потенциала</p>
                  <p>Оптимистичный — 100% от потенциала</p>
                </div>
              </li>
              <li><strong>«Скачать PDF — Потенциал роста»</strong> — документ с результатами и прогнозом</li>
            </ul>
          </div>

          {/* Шкала скорости */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg text-[#2A168F]">Шкала скорости</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-bold w-12 text-right">0</span>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Работа вхолостую, ресурсы тратятся зря</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-12 text-right">30</span>
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span>Движение есть, но бизнес на грани остановки</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-12 text-right">60</span>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span>Базовый уровень, стагнация</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-12 text-right">90</span>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span>Хороший прогресс, эффективность 50%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-12 text-right">120</span>
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Идеально выстроенная система маркетинга</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center pt-4 pb-8">
          <Button variant="hero" size="xl" onClick={() => navigate('/')}>
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;
