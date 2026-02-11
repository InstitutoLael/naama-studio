import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) => {
  return (
    <div
      role="status"
      aria-label="Cargando contenido"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(43,43,43,0.06) 25%, rgba(43,43,43,0.12) 50%, rgba(43,43,43,0.06) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style
      }}
    />
  );
};

export default Skeleton;
