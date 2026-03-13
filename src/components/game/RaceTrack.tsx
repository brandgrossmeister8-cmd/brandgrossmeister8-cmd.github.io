import { Player } from '@/types/game';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RaceTrackProps {
  players: Player[];
  maxSpeed?: number;
  className?: string;
  compact?: boolean;
}

const CAR_EMOJIS = ['🏎️', '🚗', '🏁', '🚙', '🚕', '🚘'];
const COLORS = [
  'bg-primary', 'bg-secondary', 'bg-success', 'bg-spectator',
  'bg-destructive', 'bg-dark',
];

export function RaceTrack({ players, maxSpeed = 120, className, compact }: RaceTrackProps) {
  const sorted = [...players].sort((a, b) => b.speed - a.speed);

  return (
    <div className={cn(
      'relative w-full rounded-xl overflow-hidden border-2 border-track-line/30',
      compact ? 'p-3' : 'p-6',
      className
    )}>
      {/* Track background with texture */}
      <div className="absolute inset-0 bg-track rounded-xl" />
      
      {/* Checkered edge strips */}
      <div className="absolute inset-x-0 top-0 h-3 bg-checkered opacity-40" />
      <div className="absolute inset-x-0 bottom-0 h-3 bg-checkered opacity-40" />
      
      {/* Red-white kerb stripes on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{
        background: 'repeating-linear-gradient(180deg, hsl(0 72% 51%) 0px, hsl(0 72% 51%) 8px, hsl(0 0% 100% / 0.8) 8px, hsl(0 0% 100% / 0.8) 16px)'
      }} />
      <div className="absolute right-0 top-0 bottom-0 w-2" style={{
        background: 'repeating-linear-gradient(180deg, hsl(0 72% 51%) 0px, hsl(0 72% 51%) 8px, hsl(0 0% 100% / 0.8) 8px, hsl(0 0% 100% / 0.8) 16px)'
      }} />

      {/* Lane dividers */}
      {sorted.length > 1 && sorted.slice(0, -1).map((_, idx) => (
        <div
          key={`lane-${idx}`}
          className="absolute inset-x-6 border-t border-dashed border-track-line/20"
          style={{ top: `${((idx + 1) / sorted.length) * 100}%` }}
        />
      ))}

      {/* Animated road markings at bottom */}
      <div className="absolute inset-x-6 bottom-1 h-[3px] road-markings rounded-full" />

      <div className="relative space-y-3 ml-3 mr-3">
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
              <div className="flex-1 relative h-9 rounded-full bg-track-surface overflow-hidden border border-track-line/10">
                {/* Speed streaks */}
                {progress > 30 && (
                  <div className="absolute inset-y-0 left-0 right-1/2 overflow-hidden">
                    <div className="absolute inset-y-2 left-4 w-8 h-1 bg-track-line/20 rounded animate-speed-dash" style={{ animationDelay: `${idx * 0.3}s` }} />
                  </div>
                )}
                <motion.div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-2 gap-1',
                    COLORS[idx % COLORS.length],
                  )}
                  initial={false}
                  animate={{ width: `${Math.max(progress, 12)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                >
                  <span className="text-xs font-bold text-primary-foreground truncate">
                    {compact ? player.name.slice(0, 6) : player.name}
                  </span>
                  <span className="text-sm">{CAR_EMOJIS[idx % CAR_EMOJIS.length]}</span>
                </motion.div>
              </div>
              <span className="text-xs font-bold text-primary-foreground shrink-0 w-16 text-right tabular-nums">
                {player.speed} км/ч
              </span>
            </div>
          );
        })}
      </div>

      {/* Finish flag */}
      <div className="absolute right-3 top-3 text-xl animate-flag-wave">🏁</div>
      
      {/* Start lights indicator */}
      <div className="absolute left-4 top-3 flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-success/60 border border-success/30" />
        ))}
      </div>
    </div>
  );
}
