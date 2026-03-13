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
    <div className="relative w-full h-12 rounded-xl bg-track overflow-hidden border-2 border-track-line/20">
      {/* Kerb stripes */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{
        background: 'repeating-linear-gradient(180deg, hsl(0 72% 51%) 0px, hsl(0 72% 51%) 4px, hsl(0 0% 100% / 0.7) 4px, hsl(0 0% 100% / 0.7) 8px)'
      }} />
      <div className="absolute right-0 top-0 bottom-0 w-1.5" style={{
        background: 'repeating-linear-gradient(180deg, hsl(0 72% 51%) 0px, hsl(0 72% 51%) 4px, hsl(0 0% 100% / 0.7) 4px, hsl(0 0% 100% / 0.7) 8px)'
      }} />

      {/* Center dashes */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[2px] road-markings" />

      {sorted.map((p) => {
        const pct = Math.min((p.speed / maxSpeed) * 85, 85) + 5;
        return (
          <div
            key={p.id}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-700',
              p.id === myId
                ? 'bg-primary text-primary-foreground ring-2 ring-spectator glow-racing scale-110'
                : 'bg-secondary text-secondary-foreground',
            )}
            style={{ left: `${pct}%` }}
            title={`${p.name}: ${p.speed} км/ч`}
          >
            {p.id === myId ? '🏎️' : p.name.charAt(0)}
          </div>
        );
      })}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm animate-flag-wave">🏁</div>
    </div>
  );
}
