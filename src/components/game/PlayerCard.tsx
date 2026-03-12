import { useState } from 'react';
import { Player, PlayerStatus } from '@/types/game';
import { SpeedBadge } from './SpeedBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  showAnswer?: boolean;
  showControls?: boolean;
  showCommentInput?: boolean;
  currentStage?: number;
  onAdjustSpeed?: (delta: 10 | -10) => void;
  onPlayerComment?: (comment: string) => void;
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

function formatAnswer(answer: unknown): string {
  if (typeof answer === 'string') return answer;
  if (typeof answer === 'number') return `${answer}%`;
  if (typeof answer === 'object' && answer !== null) {
    const obj = answer as Record<string, unknown>;
    if (obj.type && obj.fields) {
      const fields = obj.fields as Record<string, string>;
      return `${obj.type}: ${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
    }
    return JSON.stringify(answer, null, 2);
  }
  return String(answer);
}

export function PlayerCard({ player, showAnswer, showControls, showCommentInput, currentStage, onAdjustSpeed, onPlayerComment }: PlayerCardProps) {
  const answer = currentStage !== undefined ? player.answers[currentStage] : undefined;
  const [localComment, setLocalComment] = useState(player.adminPlayerComment || '');

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
          {formatAnswer(answer)}
        </div>
      )}

      {showAnswer && answer === undefined && player.status === 'waiting' && (
        <div className="p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground text-center italic">
          Ещё не ответил...
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

      {showCommentInput && onPlayerComment && (
        <div className="space-y-2 pt-1 border-t border-border/50">
          <textarea
            value={localComment}
            onChange={e => setLocalComment(e.target.value)}
            placeholder={`Комментарий для ${player.name}...`}
            rows={2}
            className="w-full p-2 rounded-lg border bg-background resize-none focus:ring-2 focus:ring-primary outline-none text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => onPlayerComment(localComment)}
            disabled={!localComment.trim()}
          >
            💬 Сохранить комментарий
          </Button>
          {player.adminPlayerComment && (
            <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <span className="font-medium text-primary">Комментарий:</span> {player.adminPlayerComment}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
