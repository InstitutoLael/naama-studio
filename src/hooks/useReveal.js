import { useEffect } from 'react';

export const useReveal = (dependency) => {
  useEffect(() => {
    // Add small delay to ensure all DOM elements are fully rendered before observing
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px -30px 0px',
        }
      );

      const elements = document.querySelectorAll('.reveal');
      elements.forEach((el) => observer.observe(el));

      return () => {
        elements.forEach((el) => {
          try {
            observer.unobserve(el);
          } catch (e) {}
        });
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [dependency]);
};

export default useReveal;
