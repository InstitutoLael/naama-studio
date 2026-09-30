import React from 'react';

/**
 * Logo "NAAMÁ STUDIO" (vector en /public/brand/naama-logo.svg).
 * Se pinta con una máscara CSS, así toma el color del texto (currentColor)
 * y se ve nítido en cualquier tamaño.
 */
const Logo = ({ className = '', label = 'Naamá Studio' }) => (
  <span className={`logo ${className}`} role="img" aria-label={label} />
);

export default Logo;
