import { useNavigate, Link } from 'react-router-dom';
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
          <h2 className="text-3xl font-bold mt-2">Инструкция</h2>
        </div>

        {/* Для ведущего */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-[#2A168F]">Инструкция для ведущего</h3>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg">Подготовка к игре</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Получите от администратора <strong>код доступа</strong> или <strong>ссылку</strong></li>
              <li>Скачайте и распечатайте Бортовой журнал игрока — раздайте каждому участнику перед игрой. В журнале все вопросы и поля для записей</li>
            </ol>
            <Button variant="hero" className="w-full bg-[#2A168F] hover:bg-[#2A168F]/90 text-white" onClick={() => navigate('/journal')}>
              Скачать Бортовой журнал игрока (PDF)
            </Button>
            <ol start={3} className="list-decimal list-inside space-y-2 text-sm">
              <li>Откройте сайт и нажмите «Начать игру»</li>
              <li>Введите свой код (например <code className="bg-muted px-1 rounded">RITA-5Z</code>) и нажмите «Войти»</li>
              <li>Код запомнится — при следующем входе вводить не нужно</li>
            </ol>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg">Ход игры</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Титульная страница</strong> — нажмите «Далее»</li>
              <li><strong>Правила</strong> — ознакомьтесь, нажмите «Далее»</li>
              <li><strong>Регистрация игроков</strong> — введите имя и бизнес каждого участника (до 6 человек), нажмите «Начать игру»</li>
              <li><strong>Игровой экран</strong> — 3 сворачиваемых блока (см. ниже)</li>
            </ol>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg">Игровой экран — 3 блока</h4>

            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="font-bold text-[#2A168F]">БОРТОВОЙ ЖУРНАЛ</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Включайте / останавливайте таймер</li>
                  <li>Переходите к следующему этапу</li>
                  <li>Видите гоночную трассу с позициями игроков</li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="font-bold text-[#2A168F]">ГОРОД (название этапа)</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Показывайте вопрос этапа участникам</li>
                  <li>Нажимайте на карточки — появится описание варианта</li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="font-bold text-[#2A168F]">ПИТ-СТОП</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Вносите ответ каждого игрока → «Сохранить ответ игрока»</li>
                  <li>После сохранения статус меняется на <strong>«Ответ принят»</strong></li>
                  <li>Оцените ответ: <strong>+10 км/ч</strong> (хороший) или <strong>-10 км/ч</strong> (слабый)</li>
                  <li>Статус меняется на <strong>«Оценка выполнена»</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg">6 этапов игры</h4>
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
                    <td className="py-2">Выберите тип продукта</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">2</td>
                    <td className="py-2 pr-4 font-medium">Брендск</td>
                    <td className="py-2 pr-4">30 сек</td>
                    <td className="py-2">Бренд vs Ассортимент (слайдер)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">3</td>
                    <td className="py-2 pr-4 font-medium">Зачемград</td>
                    <td className="py-2 pr-4">3 мин</td>
                    <td className="py-2">Зачем клиенты покупают?</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">4</td>
                    <td className="py-2 pr-4 font-medium">Траффик-Сити</td>
                    <td className="py-2 pr-4">30 сек</td>
                    <td className="py-2">Как привлекаете клиентов?</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">5</td>
                    <td className="py-2 pr-4 font-medium">Цалово</td>
                    <td className="py-2 pr-4">3 мин</td>
                    <td className="py-2">B2B/B2C — параметры ЦА</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">6</td>
                    <td className="py-2 pr-4 font-medium">Выборг</td>
                    <td className="py-2 pr-4">30 сек</td>
                    <td className="py-2">Системность vs Креативность</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h4 className="font-bold text-lg">Завершение игры</h4>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li>Нажмите «Завершить игру» — появятся итоговые результаты</li>
              <li>Цвета результатов:
                <span className="inline-block ml-2 px-2 py-0.5 rounded bg-red-100 text-red-900 text-xs font-medium">менее 60 км/ч</span>
                <span className="inline-block ml-1 px-2 py-0.5 rounded bg-white border text-black text-xs font-medium">60 км/ч</span>
                <span className="inline-block ml-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 text-xs font-medium">61–100 км/ч</span>
                <span className="inline-block ml-1 px-2 py-0.5 rounded bg-green-100 text-green-900 text-xs font-medium">более 100 км/ч</span>
              </li>
              <li>«Начать новую игру» — вернёт на главную страницу</li>
            </ul>
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
