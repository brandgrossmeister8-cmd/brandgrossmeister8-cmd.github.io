import { BRAND_NAME, GAME_TITLE } from '@/config/stages';
import { Button } from '@/components/ui/button';

const JournalPrintPage = () => {
  return (
    <div>
      {/* Кнопка печати — не печатается */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <Button variant="hero" onClick={() => window.print()}>
          Распечатать / Сохранить PDF
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Назад
        </Button>
      </div>

      {/* Печатная версия */}
      <div className="max-w-[210mm] mx-auto p-8 print:p-6 print:max-w-none text-black bg-white min-h-screen">
        <style>{`
          @media print {
            @page { size: A4; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
          }
        `}</style>

        {/* Титульная страница */}
        <div className="text-center mb-8 no-break">
          <p className="text-sm text-gray-500 uppercase tracking-widest">{BRAND_NAME}</p>
          <h1 className="text-3xl font-bold mt-2">{GAME_TITLE}</h1>
          <div className="text-5xl mt-4">🏎️</div>
          <h2 className="text-xl font-bold mt-4 text-[#2A168F]">БОРТОВОЙ ЖУРНАЛ ИГРОКА</h2>
          <p className="text-gray-500 mt-2 text-sm">Распечатайте и используйте для записей во время игры</p>

          <div className="mt-8 border-2 border-gray-300 rounded-xl p-4 inline-block">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400">Имя игрока</p>
                <div className="w-48 border-b-2 border-gray-300 mt-1 h-6"></div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Бизнес</p>
                <div className="w-48 border-b-2 border-gray-300 mt-1 h-6"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-[#2A168F] my-6"></div>

        {/* Этап 1 */}
        <div className="no-break mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2A168F] text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
            <div>
              <h3 className="font-bold text-lg">АССОРТИМИНСК</h3>
              <p className="text-sm text-gray-500">Выберите основной тип вашего продукта (1 мин)</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {['Товар', 'Услуга', 'Информация', 'Технология', 'Сервис', 'Сырье'].map(opt => (
              <div key={opt} className="border-2 border-gray-300 rounded-lg p-2 text-center text-sm">
                <div className="w-4 h-4 border-2 border-gray-400 rounded inline-block mr-2 align-middle"></div>
                {opt}
              </div>
            ))}
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Заметки:</p>
            <div className="space-y-3">
              <div className="border-b border-gray-200 h-5"></div>
              <div className="border-b border-gray-200 h-5"></div>
            </div>
          </div>
        </div>

        {/* Этап 2 */}
        <div className="no-break mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2A168F] text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
            <div>
              <h3 className="font-bold text-lg">БРЕНДСК</h3>
              <p className="text-sm text-gray-500">Распределите 100% между Брендом и Ассортиментом (30 сек)</p>
            </div>
          </div>
          <div className="border-2 border-gray-300 rounded-lg p-4 mb-3">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Бренд: _____%</span>
              <span>Ассортимент: _____%</span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full border border-gray-300">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
              <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-200"></div>
              <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-200"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Заметки:</p>
            <div className="space-y-3">
              <div className="border-b border-gray-200 h-5"></div>
              <div className="border-b border-gray-200 h-5"></div>
            </div>
          </div>
        </div>

        {/* Этап 3 */}
        <div className="page-break"></div>
        <div className="no-break mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2A168F] text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
            <div>
              <h3 className="font-bold text-lg">ЗАЧЕМГРАД</h3>
              <p className="text-sm text-gray-500">Зачем клиенты покупают ваш продукт? (3 мин)</p>
            </div>
          </div>
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">Ваш ответ:</p>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border-b border-gray-200 h-5"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Этап 4 */}
        <div className="no-break mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2A168F] text-white flex items-center justify-center font-bold text-sm shrink-0">4</div>
            <div>
              <h3 className="font-bold text-lg">ТРАФФИК-СИТИ</h3>
              <p className="text-sm text-gray-500">Как вы привлекаете клиентов? (30 сек)</p>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            {['Зовем всех', 'Клиенты приходят сами', 'Зовем только тех, кто нужен'].map(opt => (
              <div key={opt} className="border-2 border-gray-300 rounded-lg p-3 text-sm">
                <div className="w-4 h-4 border-2 border-gray-400 rounded inline-block mr-2 align-middle"></div>
                {opt}
              </div>
            ))}
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Заметки:</p>
            <div className="space-y-3">
              <div className="border-b border-gray-200 h-5"></div>
              <div className="border-b border-gray-200 h-5"></div>
            </div>
          </div>
        </div>

        {/* Этап 5 */}
        <div className="page-break"></div>
        <div className="no-break mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2A168F] text-white flex items-center justify-center font-bold text-sm shrink-0">5</div>
            <div>
              <h3 className="font-bold text-lg">ЦАЛОВО</h3>
              <p className="text-sm text-gray-500">Целевая аудитория: B2B или B2C (3 мин)</p>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="border-2 border-gray-300 rounded-lg p-2 text-center text-sm flex-1">
              <div className="w-4 h-4 border-2 border-gray-400 rounded inline-block mr-1 align-middle"></div>
              B2B
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-2 text-center text-sm flex-1">
              <div className="w-4 h-4 border-2 border-gray-400 rounded inline-block mr-1 align-middle"></div>
              B2C
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-gray-300 rounded-lg p-3">
              <p className="text-xs font-bold text-gray-500 mb-2">Если B2B:</p>
              {['Зачем для бизнеса', 'Отрасль', 'Размер бизнеса', 'Форма взаимоотношений', 'ЛПР', 'Личный зачем ЛПР'].map(field => (
                <div key={field} className="mb-2">
                  <p className="text-xs text-gray-400">{field}:</p>
                  <div className="border-b border-gray-200 h-4"></div>
                </div>
              ))}
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-3">
              <p className="text-xs font-bold text-gray-500 mb-2">Если B2C:</p>
              {['Зачем', 'Модель поведения', 'Семья', 'Дети', 'Город/село', 'Возраст', 'Пол', 'Эконом. положение', 'Мотив'].map(field => (
                <div key={field} className="mb-2">
                  <p className="text-xs text-gray-400">{field}:</p>
                  <div className="border-b border-gray-200 h-4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Этап 6 */}
        <div className="no-break mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2A168F] text-white flex items-center justify-center font-bold text-sm shrink-0">6</div>
            <div>
              <h3 className="font-bold text-lg">ВЫБОРГ</h3>
              <p className="text-sm text-gray-500">Распределите 100% между Системностью и Креативностью (30 сек)</p>
            </div>
          </div>
          <div className="border-2 border-gray-300 rounded-lg p-4 mb-3">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Системность: _____%</span>
              <span>Креативность: _____%</span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full border border-gray-300">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
              <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-200"></div>
              <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-200"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Заметки:</p>
            <div className="space-y-3">
              <div className="border-b border-gray-200 h-5"></div>
              <div className="border-b border-gray-200 h-5"></div>
            </div>
          </div>
        </div>

        {/* Итоги */}
        <div className="no-break border-t-2 border-[#2A168F] pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🏁</div>
            <h3 className="font-bold text-lg">ИТОГИ ГОНКИ</h3>
          </div>
          <div className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Финальная скорость:</span>
              <div className="border-b-2 border-gray-300 w-24 h-6"></div>
              <span className="text-sm text-gray-500">км/ч</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Позиция в рейтинге:</span>
              <div className="border-b-2 border-gray-300 w-16 h-6"></div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Главный вывод:</p>
              <div className="space-y-3">
                <div className="border-b border-gray-200 h-5"></div>
                <div className="border-b border-gray-200 h-5"></div>
                <div className="border-b border-gray-200 h-5"></div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">{BRAND_NAME} | {GAME_TITLE}</p>
        </div>
      </div>
    </div>
  );
};

export default JournalPrintPage;
