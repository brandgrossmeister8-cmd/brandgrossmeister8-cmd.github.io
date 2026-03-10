import { BRAND_NAME } from '@/config/stages';

interface BrandHeaderProps {
  subtitle?: string;
  compact?: boolean;
}

export function BrandHeader({ subtitle, compact }: BrandHeaderProps) {
  return (
    <div className={`flex flex-col items-center ${compact ? 'gap-1 py-2' : 'gap-2 py-4'}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">И</span>
        </div>
        <h1 className={`font-bold text-gradient-brand ${compact ? 'text-lg' : 'text-2xl'}`}>
          {BRAND_NAME}
        </h1>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      )}
    </div>
  );
}
