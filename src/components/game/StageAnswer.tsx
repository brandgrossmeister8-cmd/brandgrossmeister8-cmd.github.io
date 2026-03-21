import { useState, useEffect } from 'react';
import { StageConfig, StageCardOption } from '@/types/game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StageAnswerProps {
  stage: StageConfig;
  onSubmit: (answer: unknown) => void;
  disabled?: boolean;
  submitted?: boolean;
}

export function StageAnswer({ stage, onSubmit, disabled, submitted }: StageAnswerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [textValue, setTextValue] = useState('');
  const [subChoice, setSubChoice] = useState<string | null>(null);
  const [cardValues, setCardValues] = useState<Record<string, string>>({});
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});

  // Load draft from localStorage for textarea
  useEffect(() => {
    if (stage.answerType === 'textarea') {
      const draft = localStorage.getItem(`draft-stage-${stage.index}`);
      if (draft) setTextValue(draft);
    }
  }, [stage.index, stage.answerType]);

  useEffect(() => {
    if (stage.answerType === 'textarea' && textValue) {
      localStorage.setItem(`draft-stage-${stage.index}`, textValue);
    }
  }, [textValue, stage.index, stage.answerType]);

  const handleSubmit = () => {
    if (disabled || submitted) return;
    switch (stage.answerType) {
      case 'single-choice':
        if (selected) onSubmit(selected);
        break;
      case 'slider':
        onSubmit(sliderValue);
        break;
      case 'textarea':
        if (textValue.trim()) {
          onSubmit(textValue.trim());
          localStorage.removeItem(`draft-stage-${stage.index}`);
        }
        break;
      case 'choice-then-cards':
        if (subChoice) onSubmit({ type: subChoice, params: cardValues, customTitles });
        break;
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-success/10 border border-success/30">
        <span className="text-2xl">✅</span>
        <span className="font-bold text-success">Ответ отправлен</span>
        <span className="text-sm text-muted-foreground">Ожидайте решения ведущего</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{stage.question}</p>

      {stage.answerType === 'single-choice' && stage.options && (
        <div className="grid grid-cols-2 gap-2">
          {stage.options.map(opt => (
            <button
              key={opt.id}
              disabled={disabled}
              onClick={() => setSelected(opt.id)}
              className={cn(
                'p-3 rounded-lg border-2 font-medium transition-all text-sm',
                selected === opt.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-card-foreground hover:border-secondary',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {stage.answerType === 'slider' && stage.sliderLabels && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-primary">{stage.sliderLabels[0]}: {sliderValue}%</span>
            <span className="text-secondary">{stage.sliderLabels[1]}: {100 - sliderValue}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={e => setSliderValue(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-3 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
          />
          <div className="flex justify-between">
            <div className="h-3 rounded-full bg-gradient-brand" style={{ width: `${sliderValue}%` }} />
          </div>
        </div>
      )}

      {stage.answerType === 'textarea' && (
        <textarea
          value={textValue}
          onChange={e => setTextValue(e.target.value)}
          disabled={disabled}
          placeholder={stage.placeholder}
          rows={5}
          className="w-full p-3 rounded-lg border bg-card text-card-foreground resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      )}

      {stage.answerType === 'choice-then-cards' && stage.subChoices && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {Object.keys(stage.subChoices).map(key => (
              <button
                key={key}
                onClick={() => { setSubChoice(key); setCardValues({}); }}
                disabled={disabled}
                className={cn(
                  'flex-1 p-3 rounded-lg border-2 font-bold transition-all',
                  subChoice === key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-card-foreground hover:border-secondary',
                )}
              >
                {key}
              </button>
            ))}
          </div>

          {subChoice && stage.subChoices[subChoice] && (
            <div className="space-y-2">
              {stage.subChoiceHints?.[subChoice] && (
                <p className="text-xs text-muted-foreground italic">{stage.subChoiceHints[subChoice]}</p>
              )}
              {stage.subChoices[subChoice].map((card: StageCardOption) => (
                <div key={card.id} className="flex items-center gap-2">
                  {card.customTitle ? (
                    <input
                      type="text"
                      value={customTitles[card.id] || ''}
                      onChange={e => setCustomTitles(prev => ({ ...prev, [card.id]: e.target.value }))}
                      placeholder="Название параметра"
                      disabled={disabled}
                      className="text-sm font-medium w-40 shrink-0 p-1 rounded border border-dashed border-primary/40 bg-primary/5 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/50"
                    />
                  ) : (
                    <span className="text-sm font-medium w-40 shrink-0">{card.label || card.placeholder || ''}</span>
                  )}
                  {card.editable && (
                    <input
                      type="text"
                      value={cardValues[card.id] || ''}
                      onChange={e => setCardValues(prev => ({ ...prev, [card.id]: e.target.value }))}
                      placeholder={card.placeholder || 'Введите значение'}
                      disabled={disabled}
                      className="flex-1 p-2 rounded-lg border bg-card text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={disabled || submitted || (
          stage.answerType === 'single-choice' && !selected
        ) || (
          stage.answerType === 'textarea' && !textValue.trim()
        ) || (
          stage.answerType === 'choice-then-cards' && !subChoice
        )}
      >
        Отправить ответ
      </Button>
    </div>
  );
}
