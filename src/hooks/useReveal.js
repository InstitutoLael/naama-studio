import { useEffect } from 'react';

export const useReveal = (dependency) => {
  useEffect(() => {
    // 1. Crear el IntersectionObserver para revelar elementos al hacer scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    // Función para buscar y observar elementos .reveal que aún no sean visibles
    const observeExisting = () => {
      const elements = document.querySelectorAll('.reveal:not(.visible)');
      elements.forEach((el) => io.observe(el));
    };

    // Observar de inmediato lo que esté en el DOM actual
    observeExisting();

    // 2. Usar MutationObserver para registrar elementos cargados de forma diferida (lazy/Suspense)
    const mutationObserver = new MutationObserver(() => {
      observeExisting();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      io.disconnect();
      mutationObserver.disconnect();
    };
  }, [dependency]);
};

export default useReveal;
