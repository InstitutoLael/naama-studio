import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { dibujarGift } from '../../lib/giftcard';

/** La gift card dibujada (I03). `ref.current.canvas` sirve para exportar a PNG o PDF. */
const GiftCardArte = forwardRef(({ g, className = '', label }, ref) => {
  const lienzo = useRef(null);
  useImperativeHandle(ref, () => ({ canvas: lienzo.current }));
  const clave = JSON.stringify(g);
  useEffect(() => {
    let vivo = true;
    const tmp = document.createElement('canvas');
    dibujarGift(tmp, g).then(() => {
      if (!vivo || !lienzo.current) return;
      const c = lienzo.current;
      c.width = tmp.width;
      c.height = tmp.height;
      c.getContext('2d').drawImage(tmp, 0, 0);
    });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
  return <canvas ref={lienzo} width="1200" height="756" className={`gc-arte ${className}`} role="img" aria-label={label ?? `Gift card ${g.diseno}`} />;
});

GiftCardArte.displayName = 'GiftCardArte';
export default GiftCardArte;
