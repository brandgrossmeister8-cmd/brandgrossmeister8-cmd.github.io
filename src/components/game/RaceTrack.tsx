import { Player } from '@/types/game';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RaceTrackProps {
  players: Player[];
  maxSpeed?: number;
  className?: string;
  compact?: boolean;
}

const COLORS = [
  'bg-primary', 'bg-secondary', 'bg-success', 'bg-spectator',
  'bg-destructive', 'bg-dark',
];

export function RaceTrack({ players, maxSpeed = 120, className, compact }: RaceTrackProps) {
  const sorted = [...players].sort((a, b) => b.speed - a.speed);

  return (
    <div className={cn('relative w-full rounded-xl overflow-hidden', compact ? 'p-3' : 'p-6', className)}>
      {/* Track background */}
      <div className="absolute inset-0 bg-track rounded-xl" />
      <div className="absolute inset-x-0 top-0 h-2 bg-track-line opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-2 bg-track-line opacity-60" />
      
      {/* Dashed center line */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-track-line opacity-30" />

      <div className="relative space-y-3">
        {sorted.map((player, idx) => {
          const progress = Math.min((player.speed / maxSpeed) * 100, 100);
          return (
            <div key={player.id} className="flex items-center gap-3">
              <span className={cn(
                'text-xs font-bold shrink-0 w-6 text-center',
                idx === 0 ? 'text-spectator' : 'text-muted-foreground'
              )}>
                #{player.position}
              </span>
              <div className="flex-1 relative h-8 rounded-full bg-track-surface overflow-hidden">
                <motion.div
                  className={cn('absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-2', COLORS[idx % COLORS.length])}
                  initial={false}
                  animate={{ width: `${Math.max(progress, 8)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                >
                  <span className="text-xs font-bold text-primary-foreground truncate">
                    {compact ? player.name.slice(0, 6) : player.name}
                  </span>
                </motion.div>
              </div>
              <span className="text-xs font-bold text-primary-foreground shrink-0 w-16 text-right">
                {player.speed} км/ч
              </span>
            </div>
          );
        })}
      </div>

      {/* Finish flag */}
      <div className="absolute right-2 top-2 text-lg animate-flag-wave">🏁</div>
    </div>
  );
}
