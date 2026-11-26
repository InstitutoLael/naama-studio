import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { ArrowRight, CloseIcon, InstagramIcon } from '../components/common/Icons';
import { galleryCategories, galleryItems } from '../data/gallery';
import { SITE } from '../data/site';
import { lockScroll } from '../lib/smoothScroll';
import '../theme/gallery.css';

const EASE = [0.16, 1, 0.3, 1];
const SELECCION = ['unas-violeta', 'evento-ondas', 'casa-fachada', 'unas-burdeo-oro', 'cabello-balayage', 'evento-maquillaje'];

const GalleryPage = () => {
  const [filter, setFilter] = useState('Todo');
  const [current, setCurrent] = useState(null);
  const [cuantas, setCuantas] = useState(9);

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

  const elegidas = SELECCION.map((n) => galleryItems.find((g) => g.photo === n)).filter(Boolean);
  const abrir = (item) => {
    setFilter('Todo');
    setCurrent(galleryItems.indexOf(item));
  };

  return (
    <div className="galeria pagina">
      <SEOHead
        title="Galería"
        description="Trabajos reales de Naamá Studio: uñas, balayage, color y cortes, y rincones de nuestra casa en San Miguel."
        image="/img/unas-burdeo-oro-960.webp"
      />

      <div className="container">
        <header className="galeria-hero">
          <Photo name="unas-burdeo-floral" alt="" priority sizes="(min-width: 1024px) 1200px, 92vw" />
          <span className="galeria-hero__eti">Galería</span>
          <span className="galeria-hero__eti galeria-hero__eti--der">N.º 1297</span>
          <h1>
            <span className="gigante">Hecho<br />a mano</span>
            <span className="firma firma--blanca">sin filtros</span>
          </h1>
        </header>
        <p className="galeria-bajada">Resultados reales de nuestras especialistas y rincones de la casa. Para ver lo más reciente, síguenos en Instagram.</p>

        <p className="eyebrow galeria-eyebrow">Seleccionadas</p>
        <ul className="galeria-mosaico">
          {elegidas.map((item) => (
            <li key={item.photo}>
              <button className="galeria-foto" onClick={() => abrir(item)} aria-label={`Ampliar: ${item.title}`}>
                <Photo name={item.photo} alt={item.title} sizes="(min-width: 1024px) 25vw, 46vw" />
                <span><small>{item.cat}</small>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="chips galeria-filtros" role="group" aria-label="Filtrar galería">
          {galleryCategories.map((c) => (
            <button key={c} className="chip" aria-pressed={filter === c} onClick={() => { setFilter(c); setCuantas(9); }}>
              {c}
            </button>
          ))}
        </div>

        <ul className="galeria-grilla" key={filter}>
          {items.slice(0, cuantas).map((item, i) => (
            <motion.li key={item.photo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE, delay: Math.min(i % 9, 8) * 0.03 }}>
              <button className="galeria-foto galeria-foto--chica" onClick={() => setCurrent(i)} aria-label={`Ampliar: ${item.title}`}>
                <Photo name={item.photo} alt={item.title} sizes="(min-width: 1024px) 25vw, 31vw" />
              </button>
            </motion.li>
          ))}
        </ul>
        {cuantas < items.length && (
          <button className="galeria-mas" onClick={() => setCuantas((n) => n + 9)}>
            Ver más fotos ({items.length - cuantas})
          </button>
        )}

        <div className="galeria-ig">
          <div>
            <p className="galeria-ig__handle">{SITE.instagramHandle}</p>
            <small>Lo más nuevo está en Instagram</small>
          </div>
          <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="btn btn--claro btn--sm">
            <InstagramIcon /> Seguir
          </a>
        </div>
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
