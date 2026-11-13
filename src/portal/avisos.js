import { api, post } from './api';

const deB64u = (s) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(t + '='.repeat((4 - (t.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const esIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const instalada = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

/** ¿Este celular puede recibir avisos? Devuelve null si sí, o el motivo si no. */
export const motivoSinAvisos = () => {
  if (typeof window === 'undefined') return 'no';
  if (esIphone() && !instalada()) return 'En iPhone, primero agrega la app a la pantalla de inicio y ábrela desde ahí.';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'Este celular o navegador no permite avisos. En iPhone, actualiza a iOS 16.4 o más nuevo.';
  }
  return null;
};

export const avisosActivos = async () => {
  if (motivoSinAvisos() || Notification.permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.getRegistration('/portal');
  return Boolean(await reg?.pushManager.getSubscription());
};

/** Pide permiso, suscribe este celular y manda un aviso de prueba. */
export async function activarAvisos() {
  const motivo = motivoSinAvisos();
  if (motivo) throw new Error(motivo);
  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') throw new Error('Quedaron bloqueados. Actívalos en Ajustes del celular → Notificaciones → Naamá.');
  const reg = (await navigator.serviceWorker.getRegistration('/portal')) ?? (await navigator.serviceWorker.register('/portal-sw.js', { scope: '/portal' }));
  await navigator.serviceWorker.ready;
  const { llave } = await api('avisos/llave');
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: deB64u(llave) });
  await post('avisos/suscribir', { suscripcion: sub.toJSON() });
  await post('avisos/probar');
}
