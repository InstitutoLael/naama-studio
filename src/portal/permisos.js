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
  { id: 'disponibilidad', nombre: 'Mi disponibilidad', corto: 'Disponibilidad', bajada: 'Cuándo vienes y quién está', permiso: null, listo: true },
  { id: 'clientas', nombre: 'Clientas', bajada: 'Sube contactos y anota quién vino', permiso: null, listo: true },
  { id: 'insumos', nombre: 'Insumos', bajada: 'Anota lo que usaste y mira lo que queda', permiso: null, listo: true },
  { id: 'compras', nombre: 'Lista de compras', bajada: 'Pide lo que falta', permiso: null, listo: true },
  { id: 'mi-mes', nombre: 'Mi mes', bajada: 'Anota lo que hiciste este mes', permiso: null, listo: true },
  { id: 'servicios', nombre: 'Servicios', corto: 'Servicios', bajada: 'Lo anotado, directo a la planilla', permiso: ['servicios', 'verServicios'], listo: true },
  { id: 'te-toca', nombre: 'Te toca', bajada: 'Clientas a las que les toca volver', permiso: 'clientas', listo: true },
  { id: 'aseo', nombre: 'Aseo y tareas', corto: 'Aseo', bajada: 'Lo que te toca hoy', permiso: null, listo: true },
  { id: 'resenas', nombre: 'Mi QR de reseñas', corto: 'Reseñas', bajada: 'Que la clienta te evalúe en Google', permiso: null, listo: true },
  { id: 'giftcards', nombre: 'Gift cards', bajada: 'Crear, vender y canjear', permiso: ['servicios', 'finanzas'], listo: true },
  { id: 'caja', nombre: 'Cierre de caja', corto: 'Caja', bajada: 'Efectivo, máquina y transferencias', permiso: 'caja', listo: true },
  { id: 'plata', nombre: 'La plata', corto: 'Plata', bajada: 'Mercado Pago, disponible y gastos fijos', permiso: 'finanzas', listo: true },
  { id: 'legal', nombre: 'Legal y pagos', bajada: 'Impuestos, honorarios, documentos', permiso: 'legal' },
  { id: 'cuentas', nombre: 'Cuentas', corto: 'Equipo', bajada: 'Quién entra y qué ve', permiso: 'cuentas', listo: true },
];
