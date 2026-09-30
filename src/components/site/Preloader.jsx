import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogoMark } from '../common/Logo';

const KEY = 'naama-intro-seen';
const EASE = [0.16, 1, 0.3, 1];

const alreadySeen = () => {
  try {
    return sessionStorage.getItem(KEY) === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
};

// Se evalúa una sola vez al cargar: permite a la portada esperar a que termine la intro.
const INTRO_ACTIVE = typeof window !== 'undefined' && !alreadySeen();
const INTRO_END = INTRO_ACTIVE ? performance.now() + 1550 : 0;
/** Segundos que faltan para que termine la intro (mínimo 0.15). */
export const introDelay = () => Math.max(0.15, (INTRO_END - performance.now()) / 1000);

/** Intro breve con el monograma; se muestra solo en la primera visita de la sesión. */
const Preloader = () => {
  const [visible, setVisible] = useState(INTRO_ACTIVE);

  useEffect(() => {
    if (!visible) return undefined;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* sin almacenamiento, no pasa nada */ }
    const t = setTimeout(() => setVisible(false), 1700);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="preloader"
          aria-hidden="true"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <LogoMark className="preloader__mark" />
          </motion.div>
          <span className="split-line preloader__word">
            <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }}>
              Naamá Studio
            </motion.span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
