import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { Reveal, SplitText } from '../components/common/Motion';
import { ArrowRight, CloseIcon, InstagramIcon } from '../components/common/Icons';
import { galleryCategories, galleryItems } from '../data/gallery';
import { SITE } from '../data/site';
import { lockScroll } from '../lib/smoothScroll';
import '../theme/gallery.css';

const EASE = [0.16, 1, 0.3, 1];

const GalleryPage = () => {
  const [filter, setFilter] = useState('Todo');
  const [current, setCurrent] = useState(null);

  const items = useMemo(
    () => (filter === 'Todo' ? galleryItems : galleryItems.filter((g) => g.cat === filter)),
    [filter],
  );

  const step = useCallback(
    (dir) => setCurrent((c) => (c === null ? c : (c + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (current === null) return undefined;
    lockScroll(true);
    const onKey = (e) => {
      if (e.key === 'Escape') setCurrent(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [current, step]);

  const active = current !== null ? items[current] : null;

  return (
    <div className="gallery-page">
      <SEOHead
        title="Galería"
        description="Trabajos reales de Naamá Studio: uñas, balayage, color y cortes, y rincones de nuestra casa en San Miguel."
        image="/img/unas-burdeo-oro-960.webp"
      />

      <header className="page-hero container">
        <p className="eyebrow">Galería</p>
        <SplitText as="h1" className="page-hero__title" onMount delay={0.15} lines={['Nuestro trabajo,', <em key="g">sin filtros.</em>]} />
        <Reveal as="p" className="lead page-hero__lead" delay={0.4}>
          Resultados reales de nuestras especialistas y rincones de la casa. Para ver lo más reciente,
          síguenos en Instagram.
        </Reveal>
      </header>

      <div className="container">
        <div className="gallery-filters" role="group" aria-label="Filtrar galería">
          {galleryCategories.map((c) => (
            <button key={c} className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>

        <ul className="masonry" key={filter}>
            {items.map((item, i) => (
              <motion.li
                key={item.photo}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
              >
                <button className="masonry__item" onClick={() => setCurrent(i)} aria-label={`Ampliar: ${item.title}`}>
                  <Photo name={item.photo} alt={item.title} sizes="(min-width: 1100px) 30vw, (min-width: 600px) 45vw, 92vw" />
                  <span className="masonry__caption">
                    <small>{item.cat}</small>
                    {item.title}
                  </span>
                </button>
              </motion.li>
            ))}
        </ul>

        <Reveal className="gallery-ig">
          <InstagramIcon className="gallery-ig__icon" />
          <p className="h3">Lo más nuevo está en <em>{SITE.instagramHandle}</em></p>
          <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="btn">
            Seguir en Instagram <ArrowRight />
          </a>
        </Reveal>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setCurrent(null)}
          >
            <motion.figure
              key={active.photo}
              className="lightbox__figure"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <Photo name={active.photo} alt={active.title} sizes="90vw" priority />
              <figcaption>
                <span>{active.cat}</span> {active.title}
                <em>{current + 1} / {items.length}</em>
              </figcaption>
            </motion.figure>
            <button className="lightbox__btn lightbox__prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Anterior">
              <ArrowRight />
            </button>
            <button className="lightbox__btn lightbox__next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Siguiente">
              <ArrowRight />
            </button>
            <button className="lightbox__btn lightbox__close" onClick={() => setCurrent(null)} aria-label="Cerrar" autoFocus>
              <CloseIcon />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
