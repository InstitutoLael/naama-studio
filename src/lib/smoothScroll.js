import Lenis from 'lenis';

// Instancia única de Lenis (scroll suave). No se activa si la persona prefiere menos movimiento.
let lenis = null;

export const initSmoothScroll = () => {
  if (lenis || typeof window === 'undefined') return lenis;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1.4 });
  const raf = (time) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
};

export const scrollToTop = (immediate = true) => {
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
};

export const scrollToElement = (el, offset = 0) => {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset });
  else el.scrollIntoView({ behavior: 'smooth' });
};

export const lockScroll = (locked) => {
  if (lenis) (locked ? lenis.stop() : lenis.start());
  document.documentElement.style.overflow = locked ? 'hidden' : '';
};
