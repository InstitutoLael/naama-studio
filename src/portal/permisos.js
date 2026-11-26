// Roles y permisos del portal. Lo usan el servidor (portal-api/) y las pantallas (src/portal/).
// Cada rol trae permisos de base; a cada persona se le pueden prender permisos extra.

export const PERMISOS = {
  cuentas: 'Crear y administrar cuentas',
  finanzas: 'Ver plata: ingresos, gastos, saldos y honorarios de todas',
  caja: 'Cierre de caja diario',
  servicios: 'Anotar y borrar servicios de la planilla',
  verServicios: 'Ver los servicios anotados (sin editarlos)',
  compras: 'Marcar compras como compradas y ver costos',
  insumos: 'Editar productos, corregir stock y ver los datos de consumo',
  clientas: 'Ver los números de las clientas e importar contactos',
  legal: 'Legal, impuestos y pagos',
};

export const ROLES = {
  admin: {
    nombre: 'Administración',
    detalle: 'Ve y maneja todo: cuentas, plata, caja, compras, legal y pagos.',
    permisos: Object.keys(PERMISOS),
  },
  duena: {
    nombre: 'Dueña',
    detalle: 'Ve todo el salón. No crea ni desactiva cuentas.',
    permisos: ['finanzas', 'caja', 'verServicios', 'compras', 'insumos', 'clientas', 'legal'],
  },
  socia: {
    nombre: 'Socia',
    detalle: 'Su agenda, sube clientas, insumos y compras. Sin plata, caja ni números de clientas.',
    permisos: [],
  },
  equipo: {
    nombre: 'Equipo',
    detalle: 'Su agenda, sube clientas, insumos y compras. Sin números de clientas.',
    permisos: [],
  },
};

export const ROL_IDS = Object.keys(ROLES);

/** Permisos efectivos de una cuenta: los del rol más los extra (sin duplicados ni desconocidos). */
export const permisosDe = (rol, extras = []) => {
  const base = ROLES[rol]?.permisos ?? [];
  return [...new Set([...base, ...extras])].filter((p) => p in PERMISOS);
};

export const puede = (cuenta, permiso) => Boolean(cuenta?.permisos?.includes(permiso));

/** ¿La cuenta ve este módulo? `permiso` puede ser uno o varios (basta con tener uno). */
export const puedeModulo = (cuenta, m) => !m.permiso || [].concat(m.permiso).some((p) => puede(cuenta, p));

// Módulos del panel. `permiso: null` = lo tienen todas las cuentas.
export const MODULOS = [
  { id: 'agenda', grupo: 'dia', nombre: 'Agenda', bajada: 'Las horas de cada una', permiso: null, listo: true },
  { id: 'disponibilidad', grupo: 'dia', nombre: 'Mi disponibilidad', corto: 'Disponibilidad', bajada: 'Cuándo vienes y quién está', permiso: null, listo: true },
  { id: 'precios', grupo: 'plata', nombre: 'Precios', bajada: 'Cuánto sale cada servicio', permiso: null, listo: true },
  { id: 'clientas', grupo: 'clientas', nombre: 'Clientas', bajada: 'Sube contactos y anota quién vino', permiso: null, listo: true },
  { id: 'insumos', grupo: 'insumos', nombre: 'Insumos', bajada: 'Anota lo que usaste y mira lo que queda', permiso: null, listo: true },
  { id: 'compras', grupo: 'insumos', nombre: 'Lista de compras', bajada: 'Pide lo que falta', permiso: null, listo: true },
  { id: 'mi-mes', grupo: 'dia', nombre: 'Mi mes', bajada: 'Anota lo que hiciste este mes', permiso: null, listo: true },
  { id: 'servicios', grupo: 'plata', nombre: 'Servicios', corto: 'Servicios', bajada: 'Lo anotado, directo a la planilla', permiso: ['servicios', 'verServicios'], listo: true },
  { id: 'te-toca', grupo: 'clientas', nombre: 'Te toca', bajada: 'Clientas a las que les toca volver', permiso: 'clientas', listo: true },
  { id: 'aseo', grupo: 'dia', nombre: 'Aseo y tareas', corto: 'Aseo', bajada: 'Lo que te toca hoy', permiso: null, listo: true },
  { id: 'resenas', grupo: 'clientas', nombre: 'Mi QR de reseñas', corto: 'Reseñas', bajada: 'Que la clienta te evalúe en Google', permiso: null, listo: true },
  { id: 'giftcards', grupo: 'clientas', nombre: 'Gift cards', bajada: 'Crear, vender y canjear', permiso: ['servicios', 'finanzas'], listo: true },
  { id: 'caja', grupo: 'plata', nombre: 'Cierre de caja', corto: 'Caja', bajada: 'Efectivo, máquina y transferencias', permiso: 'caja', listo: true },
  { id: 'plata', grupo: 'plata', nombre: 'La plata', corto: 'Plata', bajada: 'Mercado Pago, disponible y gastos fijos', permiso: 'finanzas', listo: true },
  { id: 'legal', grupo: 'plata', nombre: 'Legal y pagos', bajada: 'Impuestos, honorarios, documentos', permiso: 'legal' },
  { id: 'ayuda', grupo: 'equipo', nombre: 'Ayuda', bajada: 'Dudas, fallas o algo que cambiar', permiso: null, listo: true },
  { id: 'visitas', grupo: 'equipo', nombre: 'Visitas a la web', corto: 'Visitas', bajada: 'Cuánta gente entra y cuántas reservan', permiso: 'cuentas', listo: true },
  { id: 'cuentas', grupo: 'equipo', nombre: 'Cuentas', corto: 'Equipo', bajada: 'Quién entra y qué ve', permiso: 'cuentas', listo: true },
];

// Grupos del inicio, la hoja «Más» y la barra lateral (en este orden).
export const GRUPOS = [
  { id: 'dia', nombre: 'Día a día' },
  { id: 'clientas', nombre: 'Clientas' },
  { id: 'insumos', nombre: 'Insumos' },
  { id: 'plata', nombre: 'Plata' },
  { id: 'equipo', nombre: 'Equipo' },
];

/** Módulos listos que ve la cuenta, agrupados. */
export const modulosPorGrupo = (cuenta) =>
  GRUPOS.map((g) => ({ ...g, modulos: MODULOS.filter((m) => m.grupo === g.id && m.listo && puedeModulo(cuenta, m)) })).filter((g) => g.modulos.length);

export const nombreModulo = (m) => (m.id === 'cuentas' ? 'Equipo y cuentas' : m.nombre);
