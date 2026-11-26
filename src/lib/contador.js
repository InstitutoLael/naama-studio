// Conteo anónimo de visitas de la web (sin cookies ni datos personales): página vista, de dónde llegó
// y los toques a WhatsApp e Instagram. No cuenta al equipo (el portal marca el aparato) ni a los robots.
const enviar = (tipo, clave) => {
  try {
    if (navigator.webdriver || localStorage.getItem('naama-equipo')) return;
    fetch('/api/portal/publico/visita', {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json', 'x-naama': '1' },
      body: JSON.stringify({ tipo, clave }),
    }).catch(() => {});
  } catch {
    // sin almacenamiento o sin red: no se cuenta
  }
};

const limpia = (ruta) => (ruta.replace(/\/+$/, '') || '/').toLowerCase().slice(0, 48);

const origen = () => {
  const p = new URLSearchParams(location.search);
  const utm = (p.get('utm_source') || '').toLowerCase();
  const ref = document.referrer ? new URL(document.referrer).hostname : '';
  const de = `${utm} ${ref}`;
  if (ref && ref.endsWith(location.hostname) && !utm) return null;
  if (/instagram/.test(de)) return 'instagram';
  if (/facebook|fb\./.test(de)) return 'facebook';
  if (/whatsapp|wa\.me/.test(de)) return 'whatsapp';
  if (/tiktok/.test(de)) return 'tiktok';
  if (/google/.test(de)) return /maps|business/.test(de) ? 'google-maps' : 'google';
  if (/qr|flyer|afiche|tarjeta/.test(utm)) return 'impresos';
  return ref || utm ? 'otro' : 'directo';
};

let iniciado = false;
export const contarVisita = (ruta) => {
  if (ruta.startsWith('/portal')) return;
  enviar('visita', limpia(ruta));
  if (iniciado) return;
  iniciado = true;
  try {
    if (!sessionStorage.getItem('naama-origen')) {
      const o = origen();
      sessionStorage.setItem('naama-origen', o ?? 'interno');
      if (o) enviar('origen', o);
    }
  } catch {
    // nada
  }
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest?.('a[href]');
      if (!a || location.pathname.startsWith('/portal')) return;
      if (/wa\.me|whatsapp/.test(a.href)) enviar('whatsapp', limpia(location.pathname));
      else if (/instagram\.com/.test(a.href)) enviar('instagram', limpia(location.pathname));
    },
    { capture: true },
  );
};
