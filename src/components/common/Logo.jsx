import React, { useId } from 'react';

/** Monograma del logo: arco con cinco puntos y la "N". */
export const LogoMark = ({ className, title }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 80" className={className} role={title ? 'img' : 'presentation'} aria-label={title}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecd3b0" />
          <stop offset="0.45" stopColor="#c6a177" />
          <stop offset="1" stopColor="#9c7550" />
        </linearGradient>
      </defs>
      <path
        d="M8 74V32C8 18.7 18.7 8 32 8s24 10.7 24 24v42"
        fill="none"
        stroke={`url(#g${id})`}
        strokeWidth="1.8"
      />
      <path d="M4 76.5h56" stroke={`url(#g${id})`} strokeWidth="1.8" />
      {[[20, 20], [25.8, 16.4], [32, 15.2], [38.2, 16.4], [44, 20]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="1.7" fill={`url(#g${id})`} />
      ))}
      <text
        x="32"
        y="66"
        textAnchor="middle"
        fontFamily="'Playfair Display Variable', 'Playfair Display', Georgia, serif"
        fontSize="42"
        fill="currentColor"
      >
        N
      </text>
    </svg>
  );
};

/** Logo completo: monograma + "Naamá Studio" + bajada. */
const Logo = ({ className = '', subtitle = true }) => (
  <span className={`logo ${className}`}>
    <LogoMark className="logo__mark" />
    <span className="logo__text">
      <span className="logo__name">Naamá Studio</span>
      {subtitle && <span className="logo__sub">Beauty & Wellness House</span>}
    </span>
  </span>
);

export default Logo;
