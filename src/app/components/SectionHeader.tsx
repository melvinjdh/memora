import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  align?: 'left' | 'center';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  actionLabel = 'Lihat semua',
  onAction,
  className = '',
  align = 'left',
}) => {
  return (
    <div
      className={[
        'mb-5 flex items-end justify-between gap-4 md:mb-7',
        align === 'center' ? 'flex-col items-center text-center' : '',
        className,
      ].join(' ')}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p
            className={[
              'mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#b59a5b]/75 md:text-[11px]',
              align === 'center' ? 'text-center' : '',
            ].join(' ')}
            style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}
          >
            {eyebrow}
          </p>
        )}

        <h2
          className="text-[1.45rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#f0ebe3] md:text-[2.2rem] lg:text-[2.55rem]"
          style={{ fontFamily: "'ArtsyHeading', serif" }}
        >
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#a09a90] md:text-[15px]">
            {subtitle}
          </p>
        )}
      </div>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="hidden shrink-0 items-center gap-1 rounded-full border border-[#b59a5b]/15 bg-[#f0ebe3]/[0.03] px-4 py-2 text-[13px] font-semibold text-[#b59a5b]/90 transition hover:border-[#b59a5b]/35 hover:bg-[#b59a5b]/10 hover:text-[#c9ad6e] md:flex"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
