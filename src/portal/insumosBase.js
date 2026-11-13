// Datos base de Insumos y Compras: los usan el servidor y las pantallas.

export const CATEGORIAS_INSUMO = [
  'Color', 'Cabello', 'Uñas', 'Cejas y pestañas', 'Depilación', 'Faciales', 'Masajes', 'Maquillaje', 'Limpieza', 'Desechables', 'Otros',
];

export const UNIDADES = {
  g: { corto: 'g', largo: 'gramos' },
  ml: { corto: 'ml', largo: 'mililitros' },
  u: { corto: 'u', largo: 'unidades' },
};

// Sacados de GASTOS 2026 (a quién le compra el salón).
export const PROVEEDORES = [
  'Te Ves Linda Pro Spa', 'Optima SpA', 'Silucbeautystore', 'Cruz Verde', 'La Oferta', 'Jumbo El Llano', 'Shein', 'Mercado Libre', 'Portal El Llano',
];

/** Cuántos envases son una cantidad (1 decimal). */
export const envases = (cantidad, tamano) => (tamano > 0 ? Math.round((cantidad / tamano) * 10) / 10 : 0);

/** Número chileno: 1.234,5 */
export const num = (n, dec = 0) =>
  Number(n ?? 0).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: dec });

export const pesos = (n) => (n === null || n === undefined ? '—' : `$${num(Math.round(n))}`);
