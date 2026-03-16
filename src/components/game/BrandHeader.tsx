import { BRAND_NAME } from '@/config/stages';

interface BrandHeaderProps {
  subtitle?: string;
  compact?: boolean;
}

export function BrandHeader({ subtitle, compact }: BrandHeaderProps) {
  return (
    <div className={`flex flex-col items-center text-center w-full ${compact ? 'gap-1 py-2' : 'gap-2 py-4'}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
        <h1 className={`font-bold text-center ${compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'}`} style={{ color: '#A977FA' }}>
          {BRAND_NAME}
        </h1>
        <span className={`${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>🏁</span>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-xs sm:text-sm flex items-center justify-center gap-2 w-full">
          <span className="inline-block w-6 sm:w-8 h-0.5 bg-gradient-brand rounded shrink-0" />
          <span className="text-center">{subtitle}</span>
          <span className="inline-block w-6 sm:w-8 h-0.5 bg-gradient-brand rounded shrink-0" />
        </p>
      )}
    </div>
  );
}
