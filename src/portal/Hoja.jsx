import React, { useEffect, useRef } from 'react';
import { CloseIcon } from '../components/common/Icons';

/**
 * Ventana emergente del portal. Se cierra con la X, con Esc, tocando afuera
 * o con el botón «atrás» del celular, y bloquea el scroll de la página de atrás.
 */
// Cuántas hojas hay abiertas: al cambiar de una a otra no se toca el historial.
let abiertas = 0;

const Hoja = ({ titulo, onCerrar, children }) => {
  const cerrarRef = useRef(onCerrar);
  cerrarRef.current = onCerrar;

  useEffect(() => {
    const y = window.scrollY;
    const { body } = document;
    const previo = body.style.cssText;
    body.style.cssText += `;position:fixed;top:-${y}px;left:0;right:0;overflow:hidden`;

    // «Atrás» del celular: agregamos una entrada al historial y la consumimos al cerrar.
    abiertas += 1;
    if (!window.history.state?.hojaPortal) window.history.pushState({ hojaPortal: true }, '');
    let porAtras = false;
    const alAtras = () => {
      porAtras = true;
      cerrarRef.current();
    };
    const alTecla = (e) => e.key === 'Escape' && cerrarRef.current();
    window.addEventListener('popstate', alAtras);
    window.addEventListener('keydown', alTecla);
    return () => {
      window.removeEventListener('popstate', alAtras);
      window.removeEventListener('keydown', alTecla);
      body.style.cssText = previo;
      window.scrollTo(0, y);
      abiertas -= 1;
      setTimeout(() => {
        if (abiertas === 0 && !porAtras && window.history.state?.hojaPortal) window.history.back();
      }, 0);
    };
  }, []);

  return (
    <div className="hoja" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="hoja__panel" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="hoja__cabeza">
          <h2 className="hoja__titulo">{titulo}</h2>
          <button type="button" className="hoja__cerrar" onClick={onCerrar} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Hoja;
