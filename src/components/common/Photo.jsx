import React, { useState } from 'react';
import photos from '../../data/photos.json';

/**
 * Imagen responsiva AVIF/WebP generada por scripts/optimize-images.mjs.
 * Muestra un placeholder difuminado mientras carga.
 */
const Photo = ({
  name,
  alt,
  sizes = '100vw',
  priority = false,
  className = '',
  imgClassName = '',
  position = 'center',
  style,
}) => {
  const meta = photos[name];
  const [loaded, setLoaded] = useState(false);
  if (!meta) return null;

  const srcSet = (ext) => meta.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const fallbackWidth = meta.widths.find((w) => w >= 960) ?? meta.widths[meta.widths.length - 1];

  return (
    <div
      className={`photo ${className}`}
      data-loaded={loaded || priority}
      style={{ backgroundImage: `url(${meta.lqip})`, backgroundSize: 'cover', backgroundPosition: position, ...style }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
        <img
          src={`/img/${name}-${fallbackWidth}.webp`}
          alt={alt}
          width={meta.w}
          height={meta.h}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchpriority={priority ? 'high' : undefined}
          onLoad={() => setLoaded(true)}
          className={imgClassName}
          style={{ objectPosition: position }}
        />
      </picture>
    </div>
  );
};

export default Photo;
