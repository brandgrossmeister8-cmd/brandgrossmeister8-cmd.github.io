import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  remaining: number;
  total: number;
  running: boolean;
  className?: string;
}

export function TimerDisplay({ remaining, total, running, className }: TimerDisplayProps) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const isLow = remaining <= 10 && remaining > 0;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className={cn(
        'font-bold tabular-nums text-3xl transition-colors',
        isLow && 'text-destructive',
        remaining === 0 && 'text-muted-foreground',
        !isLow && remaining > 0 && 'text-foreground',
      )}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000',
            isLow ? 'bg-destructive' : 'bg-gradient-brand',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining === 0 && (
        <span className="text-xs text-destructive font-medium">Время вышло</span>
      )}
      {running && remaining > 0 && (
        <span className="text-xs text-muted-foreground">Идёт отсчёт</span>
      )}
    </div>
  );
}
