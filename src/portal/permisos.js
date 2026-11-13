// Roles y permisos del portal. Lo usan el servidor (portal-api/) y las pantallas (src/portal/).
// Cada rol trae permisos de base; a cada persona se le pueden prender permisos extra.

export const PERMISOS = {
  cuentas: 'Crear y administrar cuentas',
  finanzas: 'Ver plata: ingresos, gastos, saldos y honorarios de todas',
  caja: 'Cierre de caja diario',
  servicios: 'Registrar servicios en la planilla',
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
    permisos: ['finanzas', 'caja', 'servicios', 'compras', 'insumos', 'clientas', 'legal'],
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

// Módulos del panel. `permiso: null` = lo tienen todas las cuentas.
export const MODULOS = [
  { id: 'disponibilidad', nombre: 'Mi disponibilidad', bajada: 'Tus días y horas libres', permiso: null },
  { id: 'clientas', nombre: 'Clientas', bajada: 'Sube contactos y anota quién vino', permiso: null, listo: true },
  { id: 'insumos', nombre: 'Insumos', bajada: 'Anota lo que usaste y mira lo que queda', permiso: null, listo: true },
  { id: 'compras', nombre: 'Lista de compras', bajada: 'Pide lo que falta', permiso: null, listo: true },
  { id: 'mi-mes', nombre: 'Mi mes', bajada: 'Tus servicios y tu honorario', permiso: null },
  { id: 'servicios', nombre: 'Registrar servicios', bajada: 'Directo a la planilla', permiso: 'servicios' },
  { id: 'caja', nombre: 'Cierre de caja', bajada: 'Efectivo, MP y transferencias', permiso: 'caja' },
  { id: 'plata', nombre: 'La plata', bajada: 'Mercado Pago, disponible y gastos fijos', permiso: 'finanzas', listo: true },
  { id: 'legal', nombre: 'Legal y pagos', bajada: 'Impuestos, honorarios, documentos', permiso: 'legal' },
  { id: 'cuentas', nombre: 'Cuentas', bajada: 'Quién entra y qué ve', permiso: 'cuentas', listo: true },
];
