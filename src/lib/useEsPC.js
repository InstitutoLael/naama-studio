import { useEffect, useState } from 'react';

/** true en computador (≥ 1024 px). Sirve para no bajar en el celular fotos que solo se ven en computador. */
export const useEsPC = (min = 1024) => {
  const q = `(min-width: ${min}px)`;
  const [si, setSi] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setSi(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [q]);
  return si;
};
