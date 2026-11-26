import React, { useMemo } from 'react';

/*
 * Ilustración isométrica propia del barrio (no está a escala).
 * Plano en «metros/10»: x crece hacia el oriente, y hacia el sur.
 * Arcadia corre oriente–poniente; Gran Avenida, norte–sur, al oriente de la casa;
 * el metro El Llano queda al sur por Gran Avenida.
 */

const K = 9; // escala
const C = Math.cos(Math.PI / 6) * K;
const S = Math.sin(Math.PI / 6) * K;
const Z = K * 0.95; // altura

const p = (x, y, z = 0) => [(x - y) * C, (x + y) * S - z * Z];
const pts = (lista) => lista.map(([x, y, z]) => p(x, y, z).map((n) => n.toFixed(1)).join(',')).join(' ');

// Generador determinista (siempre el mismo barrio).
const azar = (semilla) => {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Calles
const GRAN_AV = { x: 15, ancho: 5 }; // eje x de Gran Avenida
const CALLES_NS = [{ x: -13, ancho: 2.4 }, GRAN_AV];
const CALLES_EO = [{ y: -13, ancho: 2.4 }, { y: 0, ancho: 2.6, nombre: 'Arcadia' }, { y: 13, ancho: 2.4 }];
const MIN = -28;
const MAX = 28;
const VEREDA = 0.9;

// La casa de Naamá: al norte de Arcadia, fachada hacia la calle (cara sur).
const CASA = { x: -1.6, y: -5.6, w: 3.6, d: 4.2, h: 3.4 };

const construir = () => {
  const r = azar(1297);
  const cajas = [];
  const arboles = [];

  // Cuadras: entre calles consecutivas
  const xs = [MIN, ...CALLES_NS.flatMap((c) => [c.x - c.ancho / 2 - VEREDA, c.x + c.ancho / 2 + VEREDA]), MAX];
  const ys = [MIN, ...CALLES_EO.flatMap((c) => [c.y - c.ancho / 2 - VEREDA, c.y + c.ancho / 2 + VEREDA]), MAX];
  const cuadras = [];
  for (let i = 0; i < xs.length; i += 2) for (let j = 0; j < ys.length; j += 2) cuadras.push({ x0: xs[i], x1: xs[i + 1], y0: ys[j], y1: ys[j + 1] });

  const choca = (b) => !(b.x + b.w <= CASA.x - 0.1 || b.x >= CASA.x + CASA.w + 0.1 || b.y + b.d <= CASA.y - 0.1 || b.y >= CASA.y + CASA.d + 0.1);
  const agregar = (b) => {
    if (!choca(b)) cajas.push(b);
  };
  const fondo = 4.2;

  for (const q of cuadras) {
    const ancho = q.x1 - q.x0;
    const alto = q.y1 - q.y0;
    if (ancho < 3 || alto < 3) continue;
    const frenteGA = Math.abs(q.x1 - (GRAN_AV.x - GRAN_AV.ancho / 2 - VEREDA)) < 0.01 || Math.abs(q.x0 - (GRAN_AV.x + GRAN_AV.ancho / 2 + VEREDA)) < 0.01;
    // Fachada continua hacia el norte y el sur de cada cuadra
    for (const lado of ['n', 's']) {
      let x = q.x0;
      while (x < q.x1 - 1.2) {
        const w = Math.min(q.x1 - x, 2.2 + r() * 2.2);
        const h = 1.9 + Math.floor(r() * 3) * 0.45 + (frenteGA && r() > 0.75 ? 2.5 + r() * 3.5 : 0);
        const d = Math.min(fondo + r() * 1.2, alto / 2 - 0.3);
        agregar({ x, y: lado === 'n' ? q.y0 : q.y1 - d, w: w - 0.12, d, h, t: Math.floor(r() * 4) });
        x += w;
      }
    }
    // Patios con árboles al centro de la cuadra
    if (alto > 2 * fondo + 2) {
      for (let k = 0; k < Math.floor(ancho / 6); k++) {
        if (r() > 0.45) arboles.push({ x: q.x0 + 2 + r() * (ancho - 4), y: q.y0 + fondo + 1 + r() * (alto - 2 * fondo - 2), s: 0.8 + r() * 0.6, patio: true });
      }
    }
  }

  // Árboles en la vereda: Arcadia y el bandejón de Gran Avenida
  for (let x = MIN + 2; x < MAX - 1; x += 4.2) {
    if (Math.abs(x - GRAN_AV.x) < 4 || Math.abs(x + 13) < 2) continue;
    arboles.push({ x: x + r(), y: 1.3 + VEREDA / 2 + 0.2, s: 0.9 + r() * 0.3 });
    if (Math.abs(x - CASA.x - 1.8) > 3) arboles.push({ x: x + 2 + r(), y: -1.3 - VEREDA / 2 - 0.2, s: 0.9 + r() * 0.3 });
  }
  for (let y = MIN + 2; y < MAX - 1; y += 3.6) {
    if (CALLES_EO.some((c) => Math.abs(y - c.y) < 2.5)) continue;
    arboles.push({ x: GRAN_AV.x, y, s: 1.05 + r() * 0.35 });
  }

  // Autos en Gran Avenida
  const autos = [];
  for (let y = MIN + 3; y < MAX - 2; y += 7 + r() * 6) autos.push({ x: GRAN_AV.x + (r() > 0.5 ? 1.4 : -1.4), y, t: Math.floor(r() * 3) });

  return { cajas, arboles, autos, cuadras };
};

// Caja con sus 3 caras visibles y sombra
const Caja = ({ b, clase }) => {
  const { x, y, w, d, h } = b;
  return (
    <g className={clase}>
      <polygon className="m-cara-y" points={pts([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]])} />
      <polygon className="m-cara-x" points={pts([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]])} />
      <polygon className="m-techo" points={pts([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]])} />
    </g>
  );
};

// Envolvente convexa (para la sombra: base + base desplazada por el sol)
const envolvente = (ps) => {
  const o = [...ps].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cruz = (o1, a, b) => (a[0] - o1[0]) * (b[1] - o1[1]) - (a[1] - o1[1]) * (b[0] - o1[0]);
  const abajo = [];
  for (const q of o) {
    while (abajo.length >= 2 && cruz(abajo[abajo.length - 2], abajo[abajo.length - 1], q) <= 0) abajo.pop();
    abajo.push(q);
  }
  const arriba = [];
  for (const q of o.reverse()) {
    while (arriba.length >= 2 && cruz(arriba[arriba.length - 2], arriba[arriba.length - 1], q) <= 0) arriba.pop();
    arriba.push(q);
  }
  return [...abajo.slice(0, -1), ...arriba.slice(0, -1)];
};

const Sombra = ({ b }) => {
  const { x, y, w, d, h } = b;
  const sx = -h * 0.6;
  const sy = -h * 0.25;
  const base = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
  const todo = [...base, ...base.map(([a, c]) => [a + sx, c + sy])];
  return <polygon className="m-sombra" points={pts(envolvente(todo).map(([a, c]) => [a, c, 0]))} />;
};

const Arbol = ({ a }) => {
  const [cx, cy] = p(a.x, a.y, 0);
  const r = a.s * K * 0.95;
  const alto = a.s * K * 1.5;
  return (
    <g className="m-arbol">
      <ellipse className="m-sombra" cx={cx - r * 0.9} cy={cy + r * 0.05} rx={r * 1.15} ry={r * 0.55} />
      <rect className="m-tronco" x={cx - 1} y={cy - alto * 0.55} width="2" height={alto * 0.55} />
      <circle className="m-copa" cx={cx} cy={cy - alto} r={r} />
      <circle className="m-copa-luz" cx={cx + r * 0.3} cy={cy - alto - r * 0.35} r={r * 0.55} />
    </g>
  );
};

const Auto = ({ a }) => {
  const b = { x: a.x - 0.5, y: a.y, w: 1, d: 2, h: 0.7 };
  const techo = { x: a.x - 0.45, y: a.y + 0.45, w: 0.9, d: 1, h: 1.15 };
  return (
    <g className={`m-auto m-auto--${a.t}`}>
      <Caja b={b} />
      <Caja b={techo} clase="m-auto__techo" />
    </g>
  );
};

// La casa roja con fachada: ventanas con reja blanca, puerta, letrero y alero
const Casa = () => {
  const { x, y, w, d, h } = CASA;
  const fy = y + d; // fachada (cara sur, mira a Arcadia)
  const ventana = (x0) => (
    <g key={x0}>
      <polygon className="m-ventana" points={pts([[x0, fy + 0.01, 1.1], [x0 + 0.75, fy + 0.01, 1.1], [x0 + 0.75, fy + 0.01, 2.5], [x0, fy + 0.01, 2.5]])} />
      {[0.25, 0.5].map((f) => (
        <polyline key={f} className="m-reja" points={pts([[x0 + 0.75 * f, fy + 0.02, 1.1], [x0 + 0.75 * f, fy + 0.02, 2.5]])} />
      ))}
      <polyline className="m-reja" points={pts([[x0, fy + 0.02, 1.8], [x0 + 0.75, fy + 0.02, 1.8]])} />
    </g>
  );
  return (
    <g className="m-naama">
      <Sombra b={CASA} />
      <polygon className="m-casa-y" points={pts([[x, fy, 0], [x + w, fy, 0], [x + w, fy, h], [x, fy, h]])} />
      <polygon className="m-casa-x" points={pts([[x + w, y, 0], [x + w, fy, 0], [x + w, fy, h], [x + w, y, h]])} />
      <polygon className="m-casa-techo" points={pts([[x - 0.15, y, h], [x + w + 0.15, y, h], [x + w + 0.15, fy + 0.25, h], [x - 0.15, fy + 0.25, h]])} />
      <polygon className="m-casa-cornisa" points={pts([[x - 0.15, fy + 0.25, h], [x + w + 0.15, fy + 0.25, h], [x + w + 0.15, fy + 0.25, h - 0.3], [x - 0.15, fy + 0.25, h - 0.3]])} />
      <polygon className="m-zocalo" points={pts([[x, fy + 0.01, 0], [x + w, fy + 0.01, 0], [x + w, fy + 0.01, 0.45], [x, fy + 0.01, 0.45]])} />
      {ventana(x + 0.35)}
      {ventana(x + w - 1.1)}
      <polygon className="m-puerta" points={pts([[x + 1.45, fy + 0.01, 0], [x + 2.15, fy + 0.01, 0], [x + 2.15, fy + 0.01, 2.3], [x + 1.45, fy + 0.01, 2.3]])} />
      <circle className="m-letrero" cx={p(x + 1.8, fy + 0.02, 2.85)[0]} cy={p(x + 1.8, fy + 0.02, 2.85)[1]} r={K * 0.32} />
    </g>
  );
};

const Mapa3D = () => {
  const { cajas, arboles, autos, cuadras } = useMemo(construir, []);

  // Orden de dibujo: lo de atrás primero (menor x + y)
  const cosas = useMemo(() => {
    const lista = [
      ...cajas.map((b) => ({ k: b.x + b.w / 2 + b.y + b.d / 2, el: <Caja key={`c${b.x},${b.y}`} b={b} clase={`m-casa m-t${b.t}`} /> })),
      ...arboles.map((a) => ({ k: a.x + a.y + 0.6, el: <Arbol key={`a${a.x},${a.y}`} a={a} /> })),
      ...autos.map((a) => ({ k: a.x + a.y + 1, el: <Auto key={`v${a.y}`} a={a} /> })),
      { k: CASA.x + CASA.w / 2 + CASA.y + CASA.d / 2, el: <Casa key="naama" /> },
    ];
    return lista.sort((a, b) => a.k - b.k).map((c) => c.el);
  }, [cajas, arboles, autos]);

  const centro = p(CASA.x + 6, CASA.y + 3);
  const pin = p(CASA.x + CASA.w / 2, CASA.y + CASA.d / 2, CASA.h);
  const arcadia = p(-8, 0.1);
  const granAv = p(GRAN_AV.x - 0.2, -10);
  const metro = p(GRAN_AV.x - 1, 17);

  return (
    <svg className="mapa3d" preserveAspectRatio="xMidYMid slice" viewBox={`${centro[0] - 230} ${centro[1] - 190} 460 420`} role="img" aria-label="Ilustración del barrio: Naamá Studio en Arcadia 1297, a pasos de Gran Avenida y del metro El Llano">

      {/* Suelo: calzada */}
      <polygon className="m-calzada" points={pts([[MIN, MIN, 0], [MAX, MIN, 0], [MAX, MAX, 0], [MIN, MAX, 0]])} />
      {/* Veredas + cuadras */}
      {cuadras.map((q) => (
        <g key={`${q.x0},${q.y0}`}>
          <polygon className="m-vereda" points={pts([[q.x0 - VEREDA, q.y0 - VEREDA, 0], [q.x1 + VEREDA, q.y0 - VEREDA, 0], [q.x1 + VEREDA, q.y1 + VEREDA, 0], [q.x0 - VEREDA, q.y1 + VEREDA, 0]])} />
          <polygon className="m-patio" points={pts([[q.x0, q.y0, 0], [q.x1, q.y0, 0], [q.x1, q.y1, 0], [q.x0, q.y1, 0]])} />
        </g>
      ))}
      {/* Bandejón de Gran Avenida y líneas */}
      <polygon className="m-bandejon" points={pts([[GRAN_AV.x - 0.55, MIN, 0], [GRAN_AV.x + 0.55, MIN, 0], [GRAN_AV.x + 0.55, MAX, 0], [GRAN_AV.x - 0.55, MAX, 0]])} />
      {CALLES_EO.map((c) => (
        <polyline key={c.y} className="m-linea" points={pts([[MIN, c.y, 0], [GRAN_AV.x - GRAN_AV.ancho / 2, c.y, 0]])} />
      ))}
      {/* Pasos de cebra en Arcadia con Gran Avenida */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <polygon key={i} className="m-cebra" points={pts([[GRAN_AV.x - GRAN_AV.ancho / 2 - 0.9, -1.1 + i * 0.42, 0], [GRAN_AV.x - GRAN_AV.ancho / 2 - 0.1, -1.1 + i * 0.42, 0], [GRAN_AV.x - GRAN_AV.ancho / 2 - 0.1, -0.9 + i * 0.42, 0], [GRAN_AV.x - GRAN_AV.ancho / 2 - 0.9, -0.9 + i * 0.42, 0]])} />
      ))}
      {/* Sombras de los edificios */}
      {cajas.map((b) => <Sombra key={`s${b.x},${b.y}`} b={b} />)}

      {/* Anillo en el suelo frente a la casa */}
      <ellipse className="m-pulso" cx={p(CASA.x + CASA.w / 2, CASA.y + CASA.d + 1)[0]} cy={p(CASA.x + CASA.w / 2, CASA.y + CASA.d + 1)[1]} rx={K * 2.6} ry={K * 1.5} />

      {cosas}

      {/* Nombres de calles */}
      <text className="m-calle" transform={`translate(${arcadia[0]} ${arcadia[1]}) rotate(30)`} textAnchor="middle">ARCADIA</text>
      <text className="m-calle" transform={`translate(${granAv[0]} ${granAv[1]}) rotate(-30)`} textAnchor="middle">GRAN AVENIDA</text>

      {/* Metro El Llano, hacia el sur por Gran Avenida */}
      <g className="m-metro" transform={`translate(${metro[0]} ${metro[1]})`}>
        <rect x="-4" y="-17" width="104" height="26" rx="13" />
        <circle cx="9" cy="-4" r="8" />
        <text x="9" y="-0.5" textAnchor="middle" className="m-metro__m">M</text>
        <text x="22" y="0">El Llano ↓</text>
      </g>

      {/* Pin */}
      <g className="m-pin" transform={`translate(${pin[0]} ${pin[1] - 8})`}>
        <ellipse className="m-pin__sombra" cx="0" cy="8" rx="9" ry="3.5" />
        <g className="m-pin__cuerpo">
          <path d="M0 0 C -14 -16 -16 -24 -16 -32 A 16 16 0 1 1 16 -32 C 16 -24 14 -16 0 0 Z" />
          <circle cx="0" cy="-32" r="6.5" />
        </g>
      </g>

    </svg>
  );
};

export default Mapa3D;
