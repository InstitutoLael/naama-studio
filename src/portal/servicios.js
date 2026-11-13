// Catálogo para anotar servicios. Sale de la planilla «Planilla Ingreso-egreso 2026» (precios y % más usados en octubre).
// Lo usan el servidor (portal-api/) y las pantallas (src/portal/). Los precios son sugerencias: siempre se pueden cambiar.

/** Profesionales tal como aparecen en la columna «Profesional» de la planilla. */
export const PROFESIONALES = [
  { id: 'VIVY - MASOTERAPEUTA', corto: 'Vivy', alias: ['vivy', 'viviana'], comision: 0.5 },
  { id: 'GABY - MANICURISTA', corto: 'Gaby', alias: ['gaby', 'gabriela'], comision: 0.5 },
  { id: 'VALERIA - ESTILISTA', corto: 'Valeria', alias: ['valeria', 'vale'], comision: 0.4 },
  { id: 'KATA - MANICURISTA', corto: 'Kata', alias: ['kata', 'katalina', 'catalina'], comision: 0.4 },
  { id: 'ALLISON - MAQUILLAJE', corto: 'Allison', alias: ['allison', 'ali'], comision: 0.6 },
  { id: 'MICHELLE - PODOLOGA', corto: 'Michelle', alias: ['michelle'], comision: 0.5 },
  { id: 'LEAH - MANICURISTA', corto: 'Leah', alias: ['leah'], comision: 0.5 },
  { id: 'SALÓN', corto: 'Salón (producto)', alias: [], comision: 0 },
];

export const MEDIOS_PAGO = ['Mercado Pago', 'Transferencia', 'Efectivo'];
export const COMISIONES = [0, 0.4, 0.5, 0.6, 1];

export const CATEGORIAS = {
  cabello: '💇 Cabello',
  unas: '💅 Uñas',
  corporal: '💆 Masaje / Corporal',
  facial: '✨ Estética Facial',
  depilacion: '🥸 Depilación',
  podologia: '🦶 Podología',
  maquillaje: '💄 Maquillaje',
  producto: '🛍️ Producto',
  otro: '🪡 Otro',
};

const s = (nombre, categoria, precio, extra = {}) => ({ nombre, categoria: CATEGORIAS[categoria], precio, ...extra });

/** Servicios frecuentes. `comisiones` = % distinto al de la profesional para ese servicio. */
export const CATALOGO = [
  s('Manos', 'unas', 23000),
  s('Pedicure', 'unas', 25000),
  s('Pies', 'unas', 25000),
  s('Retiro', 'unas', 5000),
  s('Diseños', 'unas', 6000),
  s('Limpieza de pies', 'unas', 12000),
  s('Rebaje', 'otro', 20000),
  s('Rebaje largo', 'otro', 12000),
  s('Corte', 'cabello', 16000),
  s('Corte dama', 'cabello', 16000),
  s('Corte + brushing', 'cabello', 20000),
  s('Lavado + brushing', 'cabello', 20000),
  s('Lavado nutritivo', 'cabello', 14000),
  s('Nutritivo', 'cabello', 14000),
  s('Color', 'cabello', 55000),
  s('Color global', 'cabello', 65000),
  s('Baño de color', 'cabello', 36000),
  s('Mechas', 'cabello', 95000),
  s('Deco global', 'cabello', 85000),
  s('Alisado', 'cabello', 90000),
  s('Crecimiento', 'cabello', 36000),
  s('Tratamiento SOW', 'cabello', 36000),
  s('Tratamiento Tiggi', 'cabello', 23000),
  s('Green Zoho', 'cabello', 36000),
  s('Olaplex', 'cabello', 15000),
  s('Ampolla', 'cabello', 15000),
  s('Peinado', 'cabello', 18000),
  s('Limpieza facial', 'facial', 25000),
  s('Hilos colágeno', 'facial', 10000),
  s('Extensión de pestañas', 'facial', 30000),
  s('Laminado de cejas', 'facial', 12000),
  s('Perfilado de cejas', 'depilacion', 7000),
  s('Bozo', 'depilacion', 3500),
  s('Mentón', 'depilacion', 3000),
  s('Axilas', 'depilacion', 7000),
  s('Media pierna', 'depilacion', 10000),
  s('Piernas completas', 'depilacion', 19000),
  s('Bikini', 'depilacion', 9000),
  s('Brazos', 'depilacion', 18000),
  s('Espalda', 'depilacion', 10000),
  s('Glúteos', 'depilacion', 8000),
  s('Depilación rostro', 'depilacion', 12000),
  s('Masaje', 'corporal', 25000),
  s('Drenaje', 'corporal', 26000),
  s('Pack reductivos', 'corporal', 190000),
  s('Inyección (ganancia)', 'corporal', 33724),
  s('Maquillaje + peinado', 'maquillaje', 45000),
  s('Podología', 'podologia', 20000),
  s('Pack SOW', 'producto', 42990, { salon: true }),
  s('Shampoo Tiggi', 'producto', 23990, { salon: true }),
  s('Acondicionador Tiggi', 'producto', 24000, { salon: true }),
  s('Serum', 'producto', 10000, { salon: true }),
  s('Vitamina C', 'producto', 10000, { salon: true }),
  s('Retinol', 'producto', 10000, { salon: true }),
  s('Protector', 'producto', 21000, { salon: true }),
  s('Perfume', 'producto', 16000),
  s('Aros', 'producto', 6000, { salon: true }),
  s('Anillo', 'producto', 2500, { salon: true }),
];

// % por servicio cuando no es el de siempre de la profesional (sale de la planilla).
const COMISION_ESPECIAL = {
  'VALERIA - ESTILISTA': { 'Corte': 0.5, 'Corte dama': 0.5, 'Lavado nutritivo': 0.5, 'Extensión de pestañas': 0.5, 'Maquillaje + peinado': 0.6 },
  'VIVY - MASOTERAPEUTA': { 'Perfume': 1, 'Peinado': 1 },
  'ALLISON - MAQUILLAJE': { 'Peinado': 1 },
};

const norm = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

export const buscarServicio = (nombre) => CATALOGO.find((x) => norm(x.nombre) === norm(nombre)) ?? null;

/** % sugerido para una profesional y un servicio. */
export const comisionSugerida = (profesional, servicio) => {
  const p = PROFESIONALES.find((x) => x.id === profesional);
  if (!p) return 0.5;
  const especial = Object.entries(COMISION_ESPECIAL[profesional] ?? {}).find(([n]) => norm(n) === norm(servicio));
  return especial ? especial[1] : p.comision;
};

/** Profesional de una cuenta del portal, según su nombre («Gaby», «Viviana Olivos»…). */
export const profesionalDeNombre = (nombre) => {
  const primero = norm(nombre).split(/\s+/)[0];
  return PROFESIONALES.find((p) => p.alias.includes(primero))?.id ?? null;
};

/** Mañana / Mediodía / Tarde, como en la columna «Turno» de la planilla. */
export const turnoDeHora = (hora) => (hora < 12 ? '☀️ Mañana' : hora < 15 ? '🌤️ Mediodía' : '🌙 Tarde');

/** Cálculo de la planilla (noviembre en adelante): lo que queda para la profesional y para Naamá. */
export const calcular = ({ medio, monto, propina = 0, comision }) => {
  const recibido = medio === 'Mercado Pago' ? monto - monto * 0.0219 * 1.19 : monto;
  const neto = monto / 1.19 - (monto - recibido);
  const honorario = neto * comision + propina;
  return { neto: Math.round(neto), honorario: Math.round(honorario), naama: Math.round(neto - neto * comision) };
};

/** Cuánto suele durar un servicio (para proponer el largo de la cita; siempre se puede cambiar). */
const DURACION = [
  [/mechas|deco|balayage|alisado|keratina/i, 180],
  [/color|tinte|baño/i, 120],
  [/pack|reductiv|maquillaje|peinado/i, 90],
  [/pedicure|pies|podolog|facial|limpieza|masaje|drenaje|pestaña/i, 60],
  [/manos|esmalt|uña|uñas|tratamiento|nutritivo|brushing/i, 60],
  [/corte/i, 45],
  [/bozo|axila|mentón|menton|cejas|retiro|inyecc|hilos|vitamina/i, 30],
  [/pierna|bikini|depil|espalda|brazo|glúteo|gluteo/i, 45],
];
export const minutosDe = (servicio) => DURACION.find(([r]) => r.test(servicio ?? ''))?.[1] ?? 60;
