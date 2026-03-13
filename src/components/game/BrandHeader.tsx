import { BRAND_NAME } from '@/config/stages';

interface BrandHeaderProps {
  subtitle?: string;
  compact?: boolean;
}

export function BrandHeader({ subtitle, compact }: BrandHeaderProps) {
  return (
    <div className={`flex flex-col items-center ${compact ? 'gap-1 py-2' : 'gap-2 py-4'}`}>
      <div className="flex items-center gap-3">
        <h1 className={`font-bold ${compact ? 'text-lg' : 'text-2xl'}`} style={{ color: '#A977FA' }}>
          {BRAND_NAME}
        </h1>
        <span className={`${compact ? 'text-2xl' : 'text-3xl'}`}>🏁</span>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-sm flex items-center gap-2">
          <span className="inline-block w-8 h-0.5 bg-gradient-brand rounded" />
          {subtitle}
          <span className="inline-block w-8 h-0.5 bg-gradient-brand rounded" />
        </p>
      )}
    </div>
  );
}
