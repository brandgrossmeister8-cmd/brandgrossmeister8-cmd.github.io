import { Player, PlayerStatus } from '@/types/game';
import { SpeedBadge } from './SpeedBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  showAnswer?: boolean;
  showControls?: boolean;
  currentStage?: number;
  onAdjustSpeed?: (delta: 10 | -10) => void;
}

const STATUS_LABELS: Record<PlayerStatus, string> = {
  waiting: 'Ожидает',
  submitted: 'Ответил',
  decided: 'Решение принято',
  comment: 'Комментарий',
  next: 'Далее',
};

const STATUS_COLORS: Record<PlayerStatus, string> = {
  waiting: 'bg-muted text-muted-foreground',
  submitted: 'bg-secondary/20 text-secondary',
  decided: 'bg-success/20 text-success',
  comment: 'bg-spectator/20 text-spectator-foreground',
  next: 'bg-primary/20 text-primary',
};

export function PlayerCard({ player, showAnswer, showControls, currentStage, onAdjustSpeed }: PlayerCardProps) {
  const answer = currentStage !== undefined ? player.answers[currentStage] : undefined;

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 space-y-3 transition-all',
      !player.connected && 'opacity-60',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm">
            {player.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold truncate max-w-[120px]">{player.name}</span>
        </div>
        <SpeedBadge speed={player.speed} size="sm" />
      </div>

      <div className="flex items-center justify-between">
        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', STATUS_COLORS[player.status])}>
          {STATUS_LABELS[player.status]}
        </span>
        <span className="text-xs text-muted-foreground">#{player.position}</span>
      </div>

      {showAnswer && answer !== undefined && (
        <div className="p-2 rounded-lg bg-muted text-xs break-words max-h-24 overflow-y-auto">
          {typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2)}
        </div>
      )}

      {showControls && onAdjustSpeed && (
        <div className="flex gap-2">
          <Button size="sm" variant="success" onClick={() => onAdjustSpeed(10)} className="flex-1">
            +10 км/ч
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onAdjustSpeed(-10)} className="flex-1">
            -10 км/ч
          </Button>
        </div>
      )}
    </div>
  );
}
