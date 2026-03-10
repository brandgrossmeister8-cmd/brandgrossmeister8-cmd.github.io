import { Player } from '@/types/game';
import { cn } from '@/lib/utils';

interface MiniTrackProps {
  players: Player[];
  myId?: string;
  maxSpeed?: number;
}

export function MiniTrack({ players, myId, maxSpeed = 120 }: MiniTrackProps) {
  const sorted = [...players].sort((a, b) => b.speed - a.speed);

  return (
    <div className="relative w-full h-10 rounded-full bg-track overflow-hidden border border-dashboard-border">
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-t border-dashed border-track-line opacity-20" />
      {sorted.map((p) => {
        const pct = Math.min((p.speed / maxSpeed) * 85, 85) + 5;
        return (
          <div
            key={p.id}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-700',
              p.id === myId ? 'bg-primary text-primary-foreground ring-2 ring-spectator' : 'bg-secondary text-secondary-foreground',
            )}
            style={{ left: `${pct}%` }}
            title={`${p.name}: ${p.speed} км/ч`}
          >
            {p.name.charAt(0)}
          </div>
        );
      })}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 text-sm">🏁</div>
    </div>
  );
}
