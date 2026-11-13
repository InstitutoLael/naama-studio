// Ordena los servicios de servicesData como una carta: junta las variantes por largo
// (Corto / Medio / Largo / Extra largo) en un solo servicio y los reparte en secciones.
// Lo usan la página pública de precios y la pantalla «Precios» del portal.

export const normalizar = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n');

const hay = (v) => v && String(v).trim() !== '' && v !== '---';
export const aNumero = (v) => Number(String(v ?? '').replace(/\D/g, '')) || 0;

/** «4.5 horas» → 270, «45 min» → 45, «1.2 horas c/u» → 72. */
export const minutosDeTexto = (t = '') => {
  const s = String(t).replace(',', '.');
  const h = s.match(/([\d.]+)\s*hora/);
  if (h) return Math.round(Number(h[1]) * 60);
  const m = s.match(/([\d.]+)\s*min/);
  return m ? Math.round(Number(m[1])) : 0;
};

const LARGOS = [
  ['Extra largo', /extra\s*larg/],
  ['Corto', /cort|poco cabello/],
  ['Medio', /medi|hasta el sost/],
  ['Largo', /larg/],
];
const ORDEN_LARGO = ['Corto', 'Medio', 'Largo', 'Extra largo'];

/** Separa «Balayage (Medio)» o «Brushing Medio» en base + largo. */
const partir = (nombre) => {
  const paren = nombre.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (paren) {
    const n = normalizar(paren[2]);
    const l = LARGOS.find(([, r]) => r.test(n));
    if (l && !/desde|degradado|mini|sesion|back/.test(n)) return { base: paren[1].trim(), largo: l[0] };
  }
  const fin = nombre.match(/^(.*\S)\s+(Corto|Medio|Largo|Extra largo)$/i);
  if (fin) return { base: fin[1], largo: LARGOS.find(([, r]) => r.test(normalizar(fin[2])))[0] };
  return { base: nombre, largo: null };
};

/** Agrupa variantes por largo. Devuelve la lista en el mismo orden de servicesData. */
export const agrupar = (servicios) => {
  const porBase = new Map();
  const lista = [];
  for (const s of servicios) {
    const { base, largo } = partir(s.name);
    const clave = `${s.cat}|${base}`;
    if (largo && porBase.has(clave)) {
      porBase.get(clave).variantes.push({ largo, price: s.price, old: s.old, time: s.time, nombre: s.name });
      continue;
    }
    const item = { ...s, nombre: base, variantes: largo ? [{ largo, price: s.price, old: s.old, time: s.time, nombre: s.name }] : [] };
    if (largo) porBase.set(clave, item);
    lista.push(item);
  }
  for (const it of lista) {
    it.variantes.sort((a, b) => ORDEN_LARGO.indexOf(a.largo) - ORDEN_LARGO.indexOf(b.largo));
    if (it.variantes.length === 1) {
      // Una sola variante: no vale la pena el selector.
      it.nombre = it.variantes[0].nombre;
      it.variantes = [];
    }
    if (it.variantes.length) {
      const precios = it.variantes.map((v) => aNumero(v.price)).filter(Boolean);
      it.desde = Math.min(...precios);
      it.hasta = Math.max(...precios);
    }
  }
  return lista;
};

/** Secciones dentro de cada mundo (por palabras del nombre). La primera que calza gana. */
const SECCIONES = {
  cabello: [
    ['Balayage, mechas y babylights', /balayage|mecha|babylight|fondo para/],
    ['Color', /tinte|color|crecimiento|canas|omniplex/],
    ['Alisados', /alisado/],
    ['Cortes', /corte/],
    ['Brushing, peinados y maquillaje', /brushing|peinado|plancha|maquillaje/],
    ['Tratamientos', /./],
  ],
  tratamientos: [['Tratamientos', /./]],
  unas: [
    ['Pies', /pedicure|pies|corte de unas|parafina/],
    ['Extensiones y retiros', /extension|esculpida|polygel|soft ?gel|rubber|retiro|parche/],
    ['Diseños y extras', /deco|diseno|exfoliacion/],
    ['Manos', /./],
  ],
  mirada: [
    ['Cejas y pestañas', /ceja|pestana|perfilado/],
    ['Rostro', /bozo|menton|patilla|entreceja|rostro|tapon|cuello/],
    ['Zona íntima', /rebaje|bikini|interglutea/],
    ['Cuerpo', /./],
  ],
  bienestar: [
    ['Faciales', /facial|bb |fibroblast|hilos|reafirmante|maderoterapia/],
    ['Cejas y pestañas', /ceja|pestana/],
    ['Masajes', /masaje|drenaje|reflexologia|auriculo/],
    ['Corporales', /./],
  ],
  podologia: [['Podología', /./]],
};

export const seccionDe = (mundoId, item) => {
  const n = normalizar(item.nombre);
  return (SECCIONES[mundoId] ?? [['', /./]]).find(([, r]) => r.test(n))?.[0] ?? '';
};

/** Agrupa una lista (ya filtrada a un mundo) en secciones, manteniendo el orden de SECCIONES. */
export const enSecciones = (mundoId, items) => {
  const orden = (SECCIONES[mundoId] ?? [['']]).map(([t]) => t);
  const grupos = new Map(orden.map((t) => [t, []]));
  for (const it of items) {
    const t = seccionDe(mundoId, it);
    if (!grupos.has(t)) grupos.set(t, []);
    grupos.get(t).push(it);
  }
  return [...grupos].filter(([, v]) => v.length).map(([titulo, items]) => ({ titulo, items }));
};

export const precioTexto = (v) => (hay(v) ? `$${v}` : 'Consultar');
export const esRebaja = (old, price) => hay(old) && hay(price) && aNumero(old) > aNumero(price);

/** Duración en minutos de un servicio escrito libremente («balayage largo», «rebaje completo»). */
export const duracionDeServicio = (servicios, texto) => {
  const q = normalizar(texto).trim();
  if (q.length < 3) return 0;
  const exacto = servicios.find((s) => normalizar(s.name) === q);
  if (exacto) return minutosDeTexto(exacto.time);
  const palabras = q.split(/\s+/);
  const candidato = servicios.find((s) => palabras.every((w) => normalizar(s.name).includes(w)));
  return candidato ? minutosDeTexto(candidato.time) : 0;
};
