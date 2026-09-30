// Utilidades de scroll con el scroll nativo del navegador (rápido y natural en todos los dispositivos).

export const scrollToTop = (immediate = true) => {
  window.scrollTo({ top: 0, behavior: immediate ? 'instant' : 'smooth' });
};

export const scrollToElement = (el, offset = 0) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: 'smooth' });
};

export const lockScroll = (locked) => {
  document.documentElement.style.overflow = locked ? 'hidden' : '';
};
