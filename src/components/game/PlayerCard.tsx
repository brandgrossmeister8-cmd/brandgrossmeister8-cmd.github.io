import { useState } from 'react';
import { Player, PlayerStatus, StageConfig } from '@/types/game';
import { SpeedBadge } from './SpeedBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  showAnswer?: boolean;
  showControls?: boolean;
  showCommentInput?: boolean;
  showIdentityLabels?: boolean;
  currentStage?: number;
  stageConfig?: StageConfig;
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

function formatAnswer(answer: unknown, stageConfig?: StageConfig): string {
  if (typeof answer === 'string') return answer;
  if (typeof answer === 'number') {
    if (stageConfig?.answerType === 'slider' && stageConfig.sliderLabels) {
      const [label1, label2] = stageConfig.sliderLabels;
      return `${label1}: ${answer}% / ${label2}: ${100 - answer}%`;
    }
    return `${answer}%`;
  }
  if (typeof answer === 'object' && answer !== null) {
    const obj = answer as Record<string, unknown>;
    
    // Для choice-then-cards (Цалово): показываем тип + заполненные параметры
    if (obj.type && stageConfig?.answerType === 'choice-then-cards') {
      const data = (obj.params || obj.fields) as Record<string, string> | undefined;
      const choices = stageConfig.subChoices?.[obj.type as string];
      
      // Маппинг старых id на новые для совместимости
      const oldToNewMap: Record<string, string> = {
        'sphere': 'industry',
        'size': 'business-size',
        'decision': 'decision-maker',
        'geo': 'location',
        'need': 'why-business',
        'income': 'economy',
        'interests': 'behavior',
        'pains': 'motive',
        'motivation': 'motive',
        'custom1': 'custom1',
        'custom2': 'custom2',
      };
      
      if (data && choices) {
        const lines = Object.entries(data)
          .filter(([_, v]) => v && String(v).trim())
          .map(([key, value]) => {
            // Пробуем найти по новому id или по старому через маппинг
            const newKey = oldToNewMap[key] || key;
            const choice = choices.find((c: any) => c.id === newKey || c.id === key);
            const label = choice?.label || key;
            return `${label}: ${value}`;
          });
        
        const filledCount = lines.length;
        return `${obj.type} (${filledCount})\n${lines.join('\n')}`;
      }
    }
    
    return JSON.stringify(answer, null, 2);
  }
  return String(answer);
}

export function PlayerCard({ player, showAnswer, showControls, showCommentInput, showIdentityLabels, currentStage, stageConfig, onAdjustSpeed, onPlayerComment }: PlayerCardProps) {
  const answer = currentStage !== undefined ? player.answers[currentStage] : undefined;
  const [localComment, setLocalComment] = useState(player.adminPlayerComment || '');
  
  // Получаем решение админа для текущего этапа
  const stageDelta = currentStage !== undefined && player.lastSpeedDelta 
    ? player.lastSpeedDelta[currentStage] 
    : undefined;
  const alreadyScoredThisStage = stageDelta !== undefined;

  const handleSpeed = (delta: 10 | -10) => {
    onAdjustSpeed?.(delta);
  };

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 space-y-3 transition-all',
      !player.connected && 'opacity-60',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚕</span>
          <span className="font-bold truncate max-w-[220px]">
            {showIdentityLabels ? `Имя игрока: ${player.name}` : player.name}
          </span>
        </div>
        <SpeedBadge speed={player.speed} size="sm" />
      </div>

      {player.business && (
        <div className="px-2 py-1 rounded-lg bg-muted">
          <span className="text-xs font-medium text-muted-foreground">
            {showIdentityLabels ? `Бизнес игрока: ${player.business}` : `📋 ${player.business}`}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', STATUS_COLORS[player.status])}>
          {STATUS_LABELS[player.status]}
        </span>
        <span className="text-xs text-muted-foreground">#{player.position}</span>
      </div>

      {showAnswer && answer !== undefined && (
        <div
          className="p-2 rounded-lg text-xs break-words max-h-24 overflow-y-auto font-medium transition-colors duration-300"
          style={{
            backgroundColor: stageDelta === 10 ? '#d1fae5' : stageDelta === -10 ? '#fecaca' : '#fef3c7',
            color: '#000000',
          }}
        >
          {formatAnswer(answer, stageConfig)}
        </div>
      )}

      {showControls && onAdjustSpeed && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={() => handleSpeed(10)}
            className="flex-1"
            disabled={alreadyScoredThisStage}
          >
            +10 км/ч
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleSpeed(-10)}
            className="flex-1"
            disabled={alreadyScoredThisStage}
          >
            -10 км/ч
          </Button>
        </div>
      )}
      {showControls && alreadyScoredThisStage && (
        <div className="text-[11px] text-muted-foreground text-center">
          Оценка на этом этапе уже выставлена
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
