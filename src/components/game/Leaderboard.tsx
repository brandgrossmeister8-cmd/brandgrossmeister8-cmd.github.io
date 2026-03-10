import { Player } from '@/types/game';
import { SpeedBadge } from './SpeedBadge';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  players: Player[];
  className?: string;
}

export function Leaderboard({ players, className }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => a.position - b.position);

  return (
    <div className={cn('rounded-xl border bg-card p-4', className)}>
      <h3 className="font-bold text-lg mb-3 text-gradient-brand">🏆 Рейтинг</h3>
      <div className="space-y-2">
        {sorted.map((player, idx) => (
          <div
            key={player.id}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg transition-colors',
              idx === 0 && 'bg-spectator/10 border border-spectator/30',
              idx > 0 && 'bg-muted/50',
            )}
          >
            <span className={cn(
              'text-xl font-bold w-8 text-center',
              idx === 0 && 'text-spectator',
              idx === 1 && 'text-muted-foreground',
              idx === 2 && 'text-muted-foreground',
            )}>
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
            </span>
            <span className="flex-1 font-medium truncate">{player.name}</span>
            <SpeedBadge speed={player.speed} size="sm" />
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              player.connected ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
            )}>
              {player.connected ? 'online' : 'offline'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
