import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '../common/Logo';

const KEY = 'naama-carga-vista';
const DURA = 1150; // máximo 1,2 s

const yaVista = () => {
  try {
    return localStorage.getItem(KEY) === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
};

const ACTIVA = typeof window !== 'undefined' && !yaVista();
const FIN = ACTIVA ? performance.now() + DURA : 0;
/** Segundos que faltan para que termine la carga (para que la portada espere). */
export const introDelay = () => Math.max(0.1, (FIN - performance.now()) / 1000);

/** X05 · papel, anillo terracota y el logo al centro. Solo la primera vez. */
const Preloader = () => {
  const [visible, setVisible] = useState(ACTIVA);

  useEffect(() => {
    if (!visible) return undefined;
    try { localStorage.setItem(KEY, '1'); } catch { /* sin almacenamiento */ }
    const t = setTimeout(() => setVisible(false), DURA);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="carga" aria-hidden="true" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <div className="carga__anillo">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="56" className="carga__fondo" />
              <circle cx="60" cy="60" r="56" className="carga__arco" />
            </svg>
            <Logo className="carga__logo" />
          </div>
          <p className="carga__texto">Cargando tu pausa</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
