import React from 'react';

/**
 * JapDhara Brand Logo Component
 * Concept: Sacred Om symbol + flowing Dhara water curves + 108 mala bead accent.
 * Palette: Saffron gold (#F59E0B), Teal (#0D9488), Indigo/Purple gradient.
 */
export const Logo = ({ size = 'md', variant = 'full', className = '' }) => {
  const dimensions = {
    xs: { width: 24, height: 24, text: 'text-sm' },
    sm: { width: 32, height: 32, text: 'text-base' },
    md: { width: 40, height: 40, text: 'text-lg' },
    lg: { width: 56, height: 56, text: 'text-2xl' },
    xl: { width: 80, height: 80, text: 'text-4xl' },
  }[size] || { width: 40, height: 40, text: 'text-lg' };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG Icon Mark */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="japdharaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          <linearGradient id="dharaFlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4C1D95" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Outer Circular Aura Ring */}
        <circle cx="50" cy="50" r="46" fill="url(#dharaFlow)" stroke="url(#japdharaGrad)" strokeWidth="3" />

        {/* Flowing Dhara Water Lines */}
        <path
          d="M 20 65 Q 40 45 50 65 T 80 65"
          stroke="#0D9488"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 15 75 Q 35 55 50 75 T 85 75"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Sacred Om Symbol in Center */}
        <text
          x="50%"
          y="56%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="url(#japdharaGrad)"
          fontSize="48"
          fontWeight="bold"
          fontFamily="serif"
        >
          🕉
        </text>

        {/* Guru Bead Accent */}
        <circle cx="50" cy="8" r="4" fill="#F59E0B" />
      </svg>

      {/* Brand Text (Full Variant) */}
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight ${dimensions.text} text-light-text dark:text-dark-text`}>
            Jap<span className="text-spiritual-500 font-extrabold">Dhara</span>
          </span>
          <span className="text-[9px] font-semibold text-light-muted dark:text-dark-muted tracking-widest uppercase mt-0.5">
            Let your Jaap flow
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
