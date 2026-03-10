import { useNavigate } from 'react-router-dom';
import { BrandHeader } from '@/components/game/BrandHeader';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const RulesPage = () => {
  const navigate = useNavigate();

  const rules = [
    { icon: '🏁', text: 'Каждый игрок начинает гонку со скоростью 60 км/ч' },
    { icon: '⬆️', text: 'За правильный/качественный ответ ведущий даёт +10 км/ч' },
    { icon: '⬇️', text: 'За слабый ответ — штраф -10 км/ч' },
    { icon: '📊', text: 'Скорость определяет вашу позицию на трассе и в рейтинге' },
    { icon: '📝', text: 'Ведите свой «бортовой журнал» — записывайте ключевые идеи' },
    { icon: '⏱️', text: 'На каждый этап отведено ограниченное время' },
    { icon: '🏆', text: 'Цель — финишировать с максимальной скоростью!' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full space-y-6"
      >
        <BrandHeader subtitle="Правила игры" />

        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-brand">
          <h2 className="text-xl font-bold text-center text-gradient-brand">📋 Правила маркетингового заезда</h2>

          {rules.map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <span className="text-xl shrink-0">{rule.icon}</span>
              <span className="text-sm">{rule.text}</span>
            </motion.div>
          ))}
        </div>

        <Button variant="hero" size="xl" className="w-full" onClick={() => navigate('/lobby')}>
          Продолжить →
        </Button>
      </motion.div>
    </div>
  );
};

export default RulesPage;
