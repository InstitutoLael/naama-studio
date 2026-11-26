// M01 · Movimiento al bajar: cada bloque entra con un fundido y sube 20 px (0,6 s), una sola vez.
// Si el celular pide «reducir movimiento», no se anima nada.
import { useEffect } from 'react';

const SELECTOR = 'main section, main article, main .tarjeta, main .bloque-aparece';

export const useAparecer = (clave) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('m01--in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    const inicio = performance.now();
    const marcar = () => {
      const recien = performance.now() - inicio < 1500;
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.dataset.m01 || el.closest('[data-m01="1"]:not(:scope)')) return;
        el.dataset.m01 = '1';
        // Lo que ya se ve al abrir la página no se anima: aparece al tiro (no atrasa la carga).
        if (recien && el.getBoundingClientRect().top < window.innerHeight) return;
        el.classList.add('m01');
        io.observe(el);
      });
    };
    const t = setTimeout(marcar, 60);
    const mo = new MutationObserver(() => marcar());
    const main = document.querySelector('main');
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => {
      clearTimeout(t);
      mo.disconnect();
      io.disconnect();
    };
  }, [clave]);
};
