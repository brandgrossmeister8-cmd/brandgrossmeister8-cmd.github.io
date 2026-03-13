import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { racingSounds } from '@/hooks/useRacingSounds';

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
  const wasRunning = useRef(false);
  const lastBeepTime = useRef(0);

  // Play engine rev when timer starts
  useEffect(() => {
    if (running && !wasRunning.current) {
      racingSounds.engineRev(2);
    }
    wasRunning.current = running;
  }, [running]);

  // Play countdown beeps in last 5 seconds
  useEffect(() => {
    if (running && remaining <= 5 && remaining > 0 && remaining !== lastBeepTime.current) {
      lastBeepTime.current = remaining;
      racingSounds.countdownBeep(remaining === 1);
    }
    if (remaining === 0 && running === false && total > 0) {
      racingSounds.finishFanfare();
    }
  }, [remaining, running, total]);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {/* Timer with racing frame */}
      <div className={cn(
        'relative px-6 py-2 rounded-xl border-2 transition-all',
        running && 'animate-engine-rumble',
        isLow && 'border-destructive bg-destructive/10 glow-racing',
        !isLow && running && 'border-primary/50 bg-primary/5',
        !running && 'border-border',
      )}>
        {/* Speed streaks when running */}
        {running && !isLow && (
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute top-1/3 left-0 w-6 h-0.5 bg-primary/30 animate-speed-dash" />
            <div className="absolute top-2/3 left-0 w-4 h-0.5 bg-secondary/30 animate-speed-dash" style={{ animationDelay: '0.5s' }} />
          </div>
        )}
        
        <div className={cn(
          'font-bold tabular-nums text-3xl transition-colors relative z-10',
          isLow && 'text-destructive',
          remaining === 0 && 'text-muted-foreground',
          !isLow && remaining > 0 && 'text-foreground',
        )}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar styled as track */}
      <div className="w-full h-3 rounded-full bg-muted overflow-hidden relative border border-border/50">
        {/* Checkered pattern background */}
        <div className="absolute inset-0 bg-checkered opacity-20" />
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 relative',
            isLow ? 'bg-destructive' : 'bg-gradient-brand',
          )}
          style={{ width: `${pct}%` }}
        >
          {/* Car indicator at edge */}
          {pct > 5 && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-xs">
              🏎️
            </span>
          )}
        </div>
      </div>

      {remaining === 0 && (
        <span className="text-xs text-destructive font-medium flex items-center gap-1">
          🏁 Время вышло
        </span>
      )}
      {running && remaining > 0 && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          🟢 Идёт отсчёт
        </span>
      )}
    </div>
  );
}
