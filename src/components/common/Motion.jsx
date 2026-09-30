import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

/** Aparece suavemente (fade + subida) al entrar en pantalla. */
export const Reveal = ({ as = 'div', delay = 0, y = 40, className, children, ...rest }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/**
 * Titular que se revela línea por línea, cada línea sube desde una máscara.
 * `lines`: array de nodos (cada uno es una línea).
 */
export const SplitText = ({ as = 'h2', lines, className, delay = 0, onMount = false, stagger = 0.09, ...rest }) => {
  const reduce = useReducedMotion();
  const Tag = as;
  const trigger = onMount
    ? { animate: { y: '0%' } }
    : { whileInView: { y: '0%' }, viewport: { once: true, margin: '0px 0px -10% 0px' } };

  return (
    <Tag className={className} {...rest}>
      {lines.map((line, i) => (
        <span className="split-line" key={i}>
          <motion.span
            initial={reduce ? false : { y: '105%' }}
            {...trigger}
            transition={{ duration: 1.15, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

/** Desplazamiento parallax vertical para imágenes. `amount` en porcentaje. */
export const Parallax = ({ amount = 12, className, children }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // El contenido mide (100 + 2·amount)% del contenedor; el desplazamiento se expresa
  // relativo a esa altura para que nunca se vea el borde.
  const shift = (amount * 100) / (100 + amount * 2);
  const y = useTransform(scrollYProgress, [0, 1], [`-${shift}%`, `${shift}%`]);
  return (
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        style={{
          y: reduce ? 0 : y,
          position: 'absolute',
          left: 0,
          right: 0,
          top: `-${amount}%`,
          height: `${100 + amount * 2}%`,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/** Texto cuyas palabras se iluminan a medida que haces scroll. */
export const ScrollWords = ({ text, className }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  );
};

const Word = ({ children, progress, range }) => {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity: reduce ? 1 : opacity }}>
      {children}{' '}
    </motion.span>
  );
};
