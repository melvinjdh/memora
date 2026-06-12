import React from 'react';

interface BrandLogoProps {
  tagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'gold' | 'white';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  tagline = false,
  size = 'md',
  className = '',
  variant = 'gold',
}) => {
  const logoSrc = variant === 'white' ? '/images/memora-logo-white.png' : '/images/memora-logo-gold.png';

  const iconSize =
    size === 'lg'
      ? 'h-24 w-24'
      : size === 'sm'
        ? 'h-10 w-10'
        : 'h-12 w-12';

  const titleSize =
    size === 'lg'
      ? 'text-[3rem]'
      : size === 'sm'
        ? 'text-[1.45rem]'
        : 'text-[1.85rem]';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        alt="Memora"
        className={`${iconSize} shrink-0 object-contain`}
      />

      <div className="min-w-0">
        <p
          className={`${titleSize} font-extrabold leading-none tracking-[-0.055em] text-[#f0ebe3]`}
style={{ fontFamily: "'ArtsyHeading', serif" }}
        >
          Memora
        </p>

        {tagline && (
          <p
            className="mt-3 text-[11px] font-medium uppercase tracking-[0.28em] text-[#b59a5b]"
            style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}
          >
            Memoria of Surabaya
          </p>
        )}
      </div>
    </div>
  );
};
