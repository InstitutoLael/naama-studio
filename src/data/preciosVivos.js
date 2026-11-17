// Precios de servicios editables desde el portal (Diego y Allison).
// Los cambios viven en la base de datos y se aplican encima de servicesData:
// primero lo guardado en este navegador (al instante) y luego lo último del servidor.
import { useEffect, useReducer } from 'react';
import { servicesData } from './servicesData';

const CLAVE = 'naama-precios-servicios';
const EVENTO = 'naama:precios-servicios';
export const claveServicio = (s) => `${s.cat}|${s.name}`;

const originales = new Map(servicesData.map((s) => [claveServicio(s), { price: s.price, time: s.time, old: s.old }]));

/** Aplica los cambios sobre el mismo arreglo que usan todas las pantallas. */
export function aplicarCambios(cambios) {
  for (const s of servicesData) {
    const base = originales.get(claveServicio(s));
    const c = cambios?.[claveServicio(s)];
    s.price = c?.precio ?? base.price;
    s.time = c?.tiempo ?? base.time;
    s.old = c?.precio ? '' : base.old; // si se cambió el precio, deja de mostrarse una rebaja antigua
  }
}

let actuales = {};
try {
  actuales = JSON.parse(localStorage.getItem(CLAVE) || '{}');
  aplicarCambios(actuales);
} catch {
  /* sin almacenamiento: se usan los precios de la página */
}

export function guardarLocal(cambios) {
  actuales = cambios;
  aplicarCambios(cambios);
  try {
    localStorage.setItem(CLAVE, JSON.stringify(cambios));
  } catch {
    /* nada */
  }
  window.dispatchEvent(new Event(EVENTO));
}

let pedido = null;
export function refrescarPrecios(forzar = false) {
  if (forzar) pedido = null;
  pedido ??= fetch('/api/portal/precios-servicios', forzar ? { cache: 'no-store' } : undefined)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (d?.cambios && JSON.stringify(d.cambios) !== JSON.stringify(actuales)) guardarLocal(d.cambios);
      return d;
    })
    .catch(() => null)
    .finally(() => setTimeout(() => (pedido = null), 30000));
  return pedido;
}

/** Vuelve a dibujar la pantalla cuando cambian los precios. */
export function usePreciosVivos() {
  const [version, forzar] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    window.addEventListener(EVENTO, forzar);
    refrescarPrecios();
    return () => window.removeEventListener(EVENTO, forzar);
  }, []);
  return version;
}

export const precioOriginal = (s) => originales.get(claveServicio(s));
