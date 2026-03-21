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
  isSaved?: boolean;
  onAdjustSpeed?: (delta: 10 | -10) => void;
  onPlayerComment?: (comment: string) => void;
}

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

    if (obj.type && stageConfig?.answerType === 'choice-then-cards') {
      const data = (obj.params || obj.fields) as Record<string, string> | undefined;
      const choices = stageConfig.subChoices?.[obj.type as string];

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
        // Get custom titles from customTitles object or from *-title fields
        const customTitles = (obj.customTitles as Record<string, string>) || {};

        const lines = Object.entries(data)
          .filter(([key, v]) => v && String(v).trim() && !key.endsWith('-title'))
          .map(([key, value]) => {
            const newKey = oldToNewMap[key] || key;
            const choice = choices.find((c: any) => c.id === newKey || c.id === key);
            // For custom cards, use custom title from customTitles or from -title field
            let label = choice?.label || key;
            if (choice?.customTitle) {
              const titleFromTitles = customTitles[key];
              const titleFromFields = data[`${key}-title`];
              label = titleFromTitles || titleFromFields || 'Свой параметр';
            }
            return `${label}: ${value}`;
          });

        const filledCount = lines.length;
        return `Рынок: ${obj.type} (${filledCount})\n${lines.join('\n')}`;
      }
    }

    return JSON.stringify(answer, null, 2);
  }
  return String(answer);
}

export function PlayerCard({ player, showAnswer, showControls, showCommentInput, showIdentityLabels, currentStage, stageConfig, isSaved, onAdjustSpeed, onPlayerComment }: PlayerCardProps) {
  const answer = currentStage !== undefined ? player.answers[currentStage] : undefined;

  // Получаем решение админа для текущего этапа
  const stageDelta = currentStage !== undefined && player.lastSpeedDelta
    ? player.lastSpeedDelta[currentStage]
    : undefined;
  const alreadyScoredThisStage = stageDelta !== undefined;

  // Определяем метку статуса
  let statusLabel: string;
  let statusColor: string;
  if (alreadyScoredThisStage) {
    statusLabel = 'Оценка выполнена';
    statusColor = 'bg-success/20 text-success';
  } else if (isSaved) {
    statusLabel = 'Ответ принят';
    statusColor = 'bg-secondary/20 text-secondary';
  } else {
    statusLabel = 'Ожидает';
    statusColor = 'bg-muted text-muted-foreground';
  }

  const handleSpeed = (delta: 10 | -10) => {
    onAdjustSpeed?.(delta);
  };

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 space-y-3 transition-all',
      !player.connected && 'opacity-60',
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0" style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🏎️</span>
          <span className="font-bold truncate">
            {player.name}
          </span>
          {player.business && (
            <span className="text-sm text-muted-foreground truncate">
              — {player.business}
            </span>
          )}
        </div>
        <SpeedBadge speed={player.speed} size="sm" />
      </div>

      <div className="flex items-center justify-between">
        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', statusColor)}>
          {statusLabel}
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
            disabled={alreadyScoredThisStage || !isSaved}
          >
            +10 км/ч
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleSpeed(-10)}
            className="flex-1"
            disabled={alreadyScoredThisStage || !isSaved}
          >
            -10 км/ч
          </Button>
        </div>
      )}

      {showCommentInput && onPlayerComment && (
        <div className="space-y-2 pt-1 border-t border-border/50">
          <textarea
            value={''}
            onChange={() => {}}
            placeholder={`Комментарий для ${player.name}...`}
            rows={2}
            className="w-full p-2 rounded-lg border bg-background resize-none focus:ring-2 focus:ring-primary outline-none text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => onPlayerComment('')}
          >
            Сохранить комментарий
          </Button>
        </div>
      )}
    </div>
  );
}
