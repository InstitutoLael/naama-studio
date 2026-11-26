// I03 · Gift cards digitales: 4 diseños (Cacao, Caramelo, Marfil, Burdeo) dibujados en canvas.
// Se usan en la web (vista previa), en el portal (la tarjeta real con código y vigencia) y se exportan
// a PNG 1200×756 y PDF para mandar por WhatsApp. Sin versión impresa.

export const ANCHO = 1200;
export const ALTO = 756;
export const VIGENCIA_MESES = 3;

// Colores propios de las tarjetas (piezas gráficas, no la interfaz).
export const DISENOS = {
  cacao: { nombre: 'Cacao', fondo: '#2a211d', texto: '#FAF8F4', suave: 'rgba(250,248,244,0.82)', foto: '/img/casa-sala-960.webp' },
  caramelo: { nombre: 'Caramelo', fondo: '#B07A50', texto: '#FAF8F4', suave: 'rgba(250,248,244,0.86)', cinta: '#161413' },
  marfil: { nombre: 'Marfil', fondo: '#F1E8DC', texto: '#5E2A1F', suave: '#5E2A1F', filete: '#5E2A1F' },
  burdeo: { nombre: 'Burdeo', fondo: '#6B2430', texto: '#FAF8F4', suave: 'rgba(250,248,244,0.86)', cinta: '#161413' },
};
// Diseños antiguos guardados en el portal → los nuevos.
const ANTIGUOS = { espresso: 'cacao', crema: 'marfil', arcilla: 'caramelo', dorado: 'caramelo' };
export const disenoDe = (k) => DISENOS[k] ? k : ANTIGUOS[k] ?? 'burdeo';

export const pesos = (n) => `$${Math.round(Number(n) || 0).toLocaleString('es-CL')}`;

const fotos = {};
const cargarFoto = (src) =>
  (fotos[src] ??= new Promise((ok) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => ok(null);
    im.src = src;
  }));

const FIRMA = '"Cormorant Garamond", Georgia, serif';
const SANS = '"Inter Tight Variable", "Inter Tight", system-ui, sans-serif';

const espaciado = (c, t, x, y, sep, derecha = false) => {
  const ancho = [...t].reduce((a, ch) => a + c.measureText(ch).width + sep, -sep);
  let cx = derecha ? x - ancho : x;
  const alin = c.textAlign;
  c.textAlign = 'left';
  for (const ch of t) {
    c.fillText(ch, cx, y);
    cx += c.measureText(ch).width + sep;
  }
  c.textAlign = alin;
};

const redondear = (c, x, y, w, h, r) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

/**
 * Dibuja la gift card. g = { diseno, monto, servicio?, para, de?, codigo?, vence? }
 * Si viene `codigo`, se agrega en el pie (tarjeta real del portal).
 */
export async function dibujarGift(canvas, g) {
  const k = disenoDe(g.diseno);
  const d = DISENOS[k];
  const W = ANCHO;
  const H = ALTO;
  canvas.width = W;
  canvas.height = H;
  try {
    await Promise.all([document.fonts.load(`italic 500 200px ${FIRMA}`), document.fonts.load(`600 30px ${SANS}`)]);
  } catch {
    // respaldo
  }
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, W, H);
  c.save();
  redondear(c, 0, 0, W, H, 44);
  c.clip();
  c.fillStyle = d.fondo;
  c.fillRect(0, 0, W, H);

  if (d.foto) {
    const im = await cargarFoto(d.foto);
    if (im) {
      const s = Math.max(W / im.width, H / im.height);
      c.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s);
    }
    const v = c.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, 'rgba(22,20,19,0.45)');
    v.addColorStop(0.55, 'rgba(22,20,19,0.35)');
    v.addColorStop(1, 'rgba(22,20,19,0.72)');
    c.fillStyle = v;
    c.fillRect(0, 0, W, H);
  }
  if (d.cinta) {
    c.fillStyle = d.cinta;
    c.fillRect(W * 0.715, 0, 50, H);
    c.fillRect(0, H * 0.49, W, 50);
  }
  if (d.filete) {
    c.strokeStyle = d.filete;
    c.lineWidth = 3;
    redondear(c, 30, 30, W - 60, H - 60, 26);
    c.stroke();
  }

  // Arriba: marca y valor
  c.fillStyle = d.suave;
  c.font = `600 30px ${SANS}`;
  c.textBaseline = 'alphabetic';
  espaciado(c, 'NAAMÁ STUDIO', 66, 96, 6);
  const valor = g.servicio || pesos(g.monto);
  c.fillStyle = d.texto;
  c.font = `700 ${valor.length > 18 ? 26 : 32}px ${SANS}`;
  espaciado(c, valor.toUpperCase(), W - 66, 96, 4, true);

  // Firma «Gift card»
  c.fillStyle = d.texto;
  c.font = `italic 500 210px ${FIRMA}`;
  c.fillText('Gift card', 56, 340);
  c.fillStyle = d.suave;
  c.font = `600 28px ${SANS}`;
  espaciado(c, 'UNA PAUSA PARA TI', 66, d.cinta ? H * 0.49 + 36 : 420, 6);
  if (d.cinta) {
    c.fillStyle = '#FAF8F4';
    espaciado(c, 'UNA PAUSA PARA TI', 66, H * 0.49 + 36, 6);
  }

  // Mensaje (opcional)
  if (g.mensaje && !g.codigo) {
    c.fillStyle = d.texto;
    c.font = `italic 500 40px ${FIRMA}`;
    const t = `«${g.mensaje.slice(0, 70)}${g.mensaje.length > 70 ? '…' : ''}»`;
    c.fillText(t, 66, H - 170, W * 0.62);
  }

  // Pie: para / de
  c.fillStyle = d.suave;
  c.font = `600 28px ${SANS}`;
  const pie = [g.para && `PARA ${g.para}`, g.de && `DE ${g.de}`].filter(Boolean).join(' · ').toUpperCase() || 'PARA TI';
  espaciado(c, pie, 66, H - 78, 5);
  if (g.codigo) {
    c.font = `600 20px ${SANS}`;
    const vence = g.vence ? new Date(`${g.vence}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    espaciado(c, `${g.codigo}${vence ? ` · VÁLIDA HASTA ${vence.toUpperCase()}` : ''}`, 66, H - 124, 3);
  }
  c.restore();
}

/** PDF de una página con la imagen de la tarjeta (sin librerías). */
export async function pdfDesde(canvas) {
  const fondo = document.createElement('canvas');
  fondo.width = canvas.width;
  fondo.height = canvas.height;
  const fc = fondo.getContext('2d');
  fc.fillStyle = '#FAF8F4';
  fc.fillRect(0, 0, fondo.width, fondo.height);
  fc.drawImage(canvas, 0, 0);
  const jpg = await new Promise((r) => fondo.toBlob(r, 'image/jpeg', 0.93));
  const datos = new Uint8Array(await jpg.arrayBuffer());
  const w = 600;
  const h = Math.round((600 * fondo.height) / fondo.width);
  const enc = new TextEncoder();
  const partes = [];
  const offs = [];
  let largo = 0;
  const push = (x) => {
    const b = typeof x === 'string' ? enc.encode(x) : x;
    partes.push(b);
    largo += b.length;
  };
  const obj = (n, cuerpo) => {
    offs[n] = largo;
    push(`${n} 0 obj\n`);
    cuerpo();
    push('\nendobj\n');
  };
  push('%PDF-1.4\n');
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
  obj(3, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im 4 0 R >> >> /Contents 5 0 R >>`));
  obj(4, () => {
    push(`<< /Type /XObject /Subtype /Image /Width ${fondo.width} /Height ${fondo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${datos.length} >>\nstream\n`);
    push(datos);
    push('\nendstream');
  });
  const contenido = `q ${w} 0 0 ${h} 0 0 cm /Im Do Q`;
  obj(5, () => push(`<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`));
  const xref = largo;
  push(`xref\n0 6\n0000000000 65535 f \n${[1, 2, 3, 4, 5].map((n) => `${String(offs[n]).padStart(10, '0')} 00000 n \n`).join('')}`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(partes, { type: 'application/pdf' });
}

export const pngDesde = (canvas) => new Promise((r) => canvas.toBlob(r, 'image/png'));
