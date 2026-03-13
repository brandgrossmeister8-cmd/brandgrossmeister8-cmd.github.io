import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SpeedBadgeProps {
  speed: number;
  delta?: 'up' | 'down' | null;
  size?: 'sm' | 'md' | 'lg';
}

export function SpeedBadge({ speed, delta, size = 'md' }: SpeedBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-lg',
  };

  const getColors = () => {
    if (speed > 60) return { backgroundColor: '#d1fae5', color: '#000000', border: '#6ee7b7' };
    if (speed < 60) return { backgroundColor: '#fecaca', color: '#000000', border: '#fca5a5' };
    return { backgroundColor: '#ffffff', color: '#000000', border: '#d1d5db' };
  };

  const colors = getColors();

  return (
    <motion.div
      key={speed}
      initial={{ scale: 1.15 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-bold border transition-colors duration-300',
        sizeClasses[size],
      )}
      style={{
        backgroundColor: colors.backgroundColor,
        color: colors.color,
        borderColor: colors.border,
      }}
    >
      <span>{speed}</span>
      <span className="text-xs opacity-80">км/ч</span>
    </motion.div>
  );
}
