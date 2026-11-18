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

/**
 * La carta, ordenada a mano: secciones y servicios en el orden en que se leen mejor,
 * con nombres cortos y claros (la sección ya dice «Depilación», «Hombre», etc.).
 * Cada fila: [nombre en servicesData (o base sin el largo), nombre que se muestra, opciones].
 * Opciones: { desde: true } muestra «desde» antes del precio; { oculto: true } no lo muestra.
 * Un servicio que no esté aquí cae en la sección que le toque según SECCIONES.
 */
const CARTA = {
  cabello: [
    ['Cortes', [
      ['Corte de Dama', 'Corte de dama'],
      ['Corte de Varón', 'Corte de varón'],
      ['Corte + Bordado', 'Corte + bordado'],
    ]],
    ['Color', [
      ['Omniplex (Aditivo Protector)', 'Omniplex (protector, se suma al color)'],
      ['Camuflaje de Canas (Varón)', 'Camuflaje de canas (varón)'],
      ['Baño de Color', 'Baño de color'],
      ['Crecimiento (Retoque)', 'Crecimiento (retoque de raíz)'],
      ['Baño de color + Crecimiento', 'Baño de color + crecimiento'],
      ['Tinte Global', 'Tinte global'],
    ]],
    ['Balayage, mechas y babylights', [
      ['Mecha tradicional con gorro', 'Mechas con gorro'],
      ['Balayage Tradicional sin crecimiento', 'Balayage a mano alzada'],
      ['Balayage con papel', 'Balayage con papel'],
      ['Babylights sin crecimiento', 'Babylights'],
      ['Fondo para mechas', 'Fondo para mechas'],
    ]],
    ['Alisado y botox', [
      ['Cauterización de Puntas', 'Cauterización de puntas'],
      ['Alisado Profesional', 'Alisado profesional'],
      ['Botox Capilar', 'Botox capilar'],
    ]],
    ['Brushing y peinados', [
      ['Brushing Solo', 'Brushing'],
      ['Adicional Brushing', 'Brushing (sumado a otro servicio)'],
      ['Adicional Plancha', 'Plancha (sumada a otro servicio)'],
      ['Ondas Fijadas', 'Ondas fijadas'],
      ['Adicional Peinado Básico', 'Peinado básico'],
      ['Adicional Peinado Avanzado (Desde)', 'Peinado avanzado', { desde: true }],
    ]],
    ['Maquillaje', [
      ['Maquillaje de Cejas', 'Maquillaje de cejas'],
      ['Adicional Maquillaje', 'Maquillaje'],
      ['Promo Maquillaje + Peinado Avanzado', 'Promo maquillaje + peinado avanzado'],
    ]],
  ],
  tratamientos: [
    ['Lavados', [
      ['Lavado + Secado', 'Lavado nutritivo + secado'],
      ['Lavado Nutritivo + Brushing', 'Lavado nutritivo + brushing'],
    ]],
    ['Tratamientos por línea', [
      ['Tratamiento TIGI (Bed Head)', 'Masaje capilar TIGI'],
      ['Tratamiento Capilar Pro You', 'Tratamiento Pro You'],
      ['Tratamiento Sebastian Professional', 'Masaje capilar Sebastian'],
      ['Tratamiento Green Soho', 'Masaje capilar Green Zoho (pelo ondulado)'],
      ['Tratamiento Wella', 'Tratamiento Wella'],
      ['Tratamiento SOW (Premium)', 'Masaje capilar SOW'],
    ]],
    ['Cuero cabelludo y extras', [
      ['Tratamiento Nutritivo', 'Tratamiento nutritivo'],
      ['Detox de Cuero Cabelludo', 'Detox de cuero cabelludo'],
      ['Ampolla de Rescate Inmediato', 'Ampolla'],
      ['Detox de Cuero Cabelludo + Alta Frecuencia', 'Detox de cuero cabelludo + alta frecuencia'],
    ]],
  ],
  unas: [
    ['Promos manos + pies', [
      ['Promo Manos + Pies Tradicional', 'Manos + pies tradicional (secado rápido)'],
      ['Promo Manos + Pies Permanente', 'Manos + pies permanente (decoraciones aparte)'],
    ]],
    ['Manos', [
      ['Manicure Express (Limpieza)', 'Manicure express (limpieza)'],
      ['Esmaltado de Niñas (Mini-Manicure)', 'Esmaltado niñas'],
      ['Esmaltado al Aire Tradicional', 'Esmaltado tradicional'],
      ['Esmaltado Permanente', 'Esmaltado permanente (sin diseño)'],
      ['Esmaltado Permanente (Degradado o Francesa)', 'Esmaltado permanente francesa o degradado'],
    ]],
    ['Extensiones', [
      ['Capping de Rubber', 'Kapping de rubber'],
      ['Baño de PolyGel', 'Baño de PolyGel'],
      ['Extensión de Uña / Soft Gel (Desde)', 'Extensión soft gel', { desde: true }],
      ['Esculpidas con Polygel Extension (Desde)', 'Esculpidas con PolyGel', { desde: true }],
    ]],
    ['Pies', [
      ['Corte de uñas mujeres', 'Corte de uñas'],
      ['Corte de uñas hombres', '', { oculto: true }],
      ['Pedicure Express', 'Pedicure express (limado, cutícula y 1 esmalte)'],
      ['Pedicure Tradicional', 'Pedicure tradicional spa'],
      ['Pedicure Permanente', 'Pedicure permanente'],
      ['Pedicure Spa', 'Pedicure spa'],
    ]],
    ['Diseños y retiros', [
      ['Decoraciones Uñas', 'Decoraciones (c/u)'],
      ['Diseño de Mano Alzada', 'Diseño a mano alzada'],
      ['Parche de Uñas', 'Parche de uña'],
      ['Retiro Esmalte Permanente', 'Retiro de esmalte permanente'],
      ['Retiro de Acrílico / PolyGel / SoftGel', 'Retiro de acrílico, PolyGel o soft gel'],
    ]],
    ['Spa de manos y pies', [
      ['Exfoliación de Manos', 'Exfoliación'],
      ['Guantes de Keratina', 'Guantes de keratina'],
      ['Botas de Keratina', 'Botas de keratina'],
      ['Exfoliación + Masaje de Manos', 'Exfoliación + masaje de manos'],
      ['Baño de Parafina Caliente', 'Baño de parafina'],
    ]],
  ],
  mirada: [
    ['Cejas', [
      ['Depilación Entreceja', 'Entreceja'],
      ['Perfilado de Cejas', 'Perfilado de cejas'],
      ['Henna de Cejas', 'Henna en cejas'],
      ['Lifting de Cejas', 'Lifting de cejas'],
      ['Laminado de Cejas', 'Laminado de cejas'],
    ]],
    ['Pestañas', [
      ['Tinte de Pestañas', 'Tinte de pestañas'],
      ['Lifting de Pestañas', 'Lifting de pestañas'],
      ['Ondulación de Pestañas', 'Ondulación de pestañas'],
    ]],
    ['Depilación · rostro', [
      ['Depilación Tapón de Nariz', 'Nariz'],
      ['Depilación Tapón de Orejas', 'Orejas'],
      ['Depilación de Mentón', 'Mentón'],
      ['Depilación de Patillas', 'Patillas'],
      ['Depilación de Bozo', 'Bozo'],
      ['Depilación Cuello', 'Cuello'],
      ['Depilación de Rostro Completo', 'Rostro completo (frente, mentón, mejillas y bozo)'],
    ]],
    ['Depilación · cuerpo', [
      ['Depilación de Espalda Baja', 'Espalda baja'],
      ['Depilación Axilas', 'Axilas'],
      ['Depilación de Abdomen Bajo', 'Abdomen bajo'],
      ['Depilación Medios Brazos', 'Medios brazos'],
      ['Depilación de Glúteos', 'Glúteos'],
      ['Depilación de Hombros', 'Hombros'],
      ['Depilación de Abdomen', 'Abdomen'],
      ['Depilación de Espalda Alta', 'Espalda alta'],
      ['Depilación de Medias Piernas', 'Medias piernas'],
      ['Depilación de Brazos', 'Brazos'],
      ['Depilación de Piernas Completas', 'Piernas completas'],
    ]],
    ['Depilación · zona íntima', [
      ['Depilación Tira Interglútea', 'Tira interglútea'],
      ['Depilación Rebaje Bikini', 'Rebaje bikini'],
      ['Depilación Rebaje Largo', 'Rebaje largo'],
      ['Rebaje largo + cola', 'Rebaje largo + cola'],
      ['Depilación Rebaje Completo', 'Rebaje completo'],
    ]],
    ['Depilación · hombre', [
      ['Depilación Orejas Hombre', 'Orejas'],
      ['Depilación Abdomen Bajo Hombre', 'Abdomen bajo'],
      ['Depilación Espalda Baja Hombre', 'Espalda baja'],
      ['Depilación Abdomen Hombre', 'Abdomen'],
      ['Depilación Axilas Hombre', 'Axilas'],
      ['Depilación Medias Piernas Hombre', 'Medias piernas'],
      ['Depilación Pecho Completo Hombre', 'Pecho completo'],
      ['Depilación Rostro Hombre', 'Rostro'],
      ['Depilación de Espalda Hombre', 'Espalda completa'],
      ['Depilación Piernas Completas Hombre', 'Piernas completas'],
      ['Depilación Rebaje Hombre', 'Rebaje'],
    ]],
  ],
  bienestar: [
    ['Masajes', [
      ['Masaje Descontracturante de Mandíbula', 'Masaje de mandíbula'],
      ['Auriculoterapia', 'Auriculoterapia'],
      ['Masaje de Relajación', 'Masaje de relajación'],
      ['Masaje Descontracturante', 'Masaje descontracturante'],
      ['Masaje de Craneal y Cuello', 'Masaje craneal y cuello'],
      ['Reflexología', 'Reflexología'],
    ]],
    ['Drenaje y reductivos', [
      ['Drenaje Linfático', 'Drenaje linfático'],
      ['Drenaje Linfático con Aparatología', 'Drenaje linfático con aparatología'],
      ['Masaje Reductivo', 'Masaje reductivo'],
      ['Inyecciones Lipolíticas (Sesión)', 'Inyección lipolítica (sesión)'],
      ['Pack 6 sesiones Masajes Reductivos', 'Pack 6 masajes reductivos'],
    ]],
    ['Limpiezas faciales', [
      ['Limpieza Facial Básica', 'Limpieza facial básica'],
      ['Limpieza Facial Media', 'Limpieza facial media'],
      ['Limpieza Facial Profunda', 'Limpieza facial profunda'],
      ['Limpieza de Espalda (Back Facial)', 'Limpieza de espalda'],
    ]],
    ['Estética facial', [
      ['Maderoterapia Facial (Mini)', 'Maderoterapia facial'],
      ['Hilos Colágenos', 'Hilos de colágeno'],
      ['Tratamiento Reafirmante Cuello y Escote', 'Reafirmante de cuello y escote'],
      ['BB Lips', 'BB Lips'],
      ['Fibroblast', 'Fibroblast'],
      ['BB Glow', 'BB Glow'],
    ]],
  ],
  podologia: [
    ['Podología', [
      ['Podología Clínica Básica', 'Podología básica'],
      ['Podología Clínica Avanzada', 'Podología avanzada'],
    ]],
  ],
};

const seccionPorRegex = (mundoId, item) => {
  const n = normalizar(item.nombre);
  return (SECCIONES[mundoId] ?? [['', /./]]).find(([, r]) => r.test(n))?.[0] ?? '';
};

const lugarEnCarta = (mundoId, item) => {
  const n = normalizar(item.nombre);
  for (const [titulo, filas] of CARTA[mundoId] ?? []) {
    const i = filas.findIndex(([nombre]) => normalizar(nombre) === n);
    if (i >= 0) return { titulo, orden: i, mostrar: filas[i][1], ...filas[i][2] };
  }
  return null;
};

export const seccionDe = (mundoId, item) => lugarEnCarta(mundoId, item)?.titulo ?? seccionPorRegex(mundoId, item);

/**
 * Reparte una lista (ya filtrada a un mundo) en las secciones de la carta, en su orden,
 * con el nombre corto. `original` guarda el nombre de servicesData (para agendar).
 */
export const enSecciones = (mundoId, items) => {
  const orden = (CARTA[mundoId] ?? SECCIONES[mundoId] ?? [['']]).map(([t]) => t);
  const grupos = new Map(orden.map((t) => [t, []]));
  for (const it of items) {
    const lugar = lugarEnCarta(mundoId, it);
    if (lugar?.oculto) continue;
    const t = lugar?.titulo ?? seccionPorRegex(mundoId, it);
    if (!grupos.has(t)) grupos.set(t, []);
    grupos.get(t).push({
      ...it,
      original: it.nombre,
      nombre: lugar?.mostrar || it.nombre,
      desdeTexto: Boolean(lugar?.desde),
      _orden: lugar ? lugar.orden : 999,
    });
  }
  return [...grupos]
    .filter(([, v]) => v.length)
    .map(([titulo, lista]) => ({ titulo, items: lista.sort((a, b) => a._orden - b._orden) }));
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
