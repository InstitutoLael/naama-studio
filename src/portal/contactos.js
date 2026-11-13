// Limpieza de contactos: lo usan el servidor y las pantallas.
// Muchos contactos están guardados como «Clienta María uñas», «Sra Monica» o «Feña hermana Nazarena»:
// se deja solo el nombre y lo demás pasa a una nota.

// Palabras que no son parte del nombre (se comparan sin tildes y en minúscula).
const SOBRAN = [
  'clienta', 'clientas', 'cliente', 'clientes', 'cli', 'naama', 'salon', 'studio', 'spa', 'sra', 'srta', 'sr', 'senora',
  'senorita', 'nueva', 'nuevo',
];
// Palabras de servicio: se sacan del nombre pero se guardan como nota.
const SERVICIOS = [
  'unas', 'una', 'mani', 'manicure', 'pedi', 'pedicure', 'pelo', 'corte', 'color', 'tintura', 'balayage', 'mechas',
  'alisado', 'brushing', 'peinado', 'masaje', 'masajes', 'facial', 'limpieza', 'depilacion', 'cera', 'cejas', 'pestanas',
  'lifting', 'podologia', 'podologa', 'maquillaje', 'make', 'novia', 'botox', 'keratina', 'gel', 'polygel', 'acrilico',
];
// Parentesco: desde esa palabra en adelante es una descripción, no el nombre («Feña hermana Nazarena»).
const PARENTESCO = [
  'mama', 'mami', 'madre', 'papa', 'padre', 'hermana', 'hermano', 'hija', 'hijo', 'tia', 'tio', 'prima', 'primo', 'abuela',
  'suegra', 'cunada', 'sobrina', 'nieta', 'amiga', 'polola', 'esposa', 'apoderada', 'apoderado', 'vecina', 'colega',
];
// Conectores que van en minúscula dentro de un nombre («Fran de Joel»).
const CONECTORES = ['de', 'del', 'la', 'las', 'los', 'y'];

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const capitalizar = (p) =>
  p
    .toLowerCase()
    .split('-')
    .map((x) => x.charAt(0).toLocaleUpperCase('es-CL') + x.slice(1))
    .join('-');

/** Devuelve { nombre, nota } a partir de cómo está guardado el contacto. */
export function limpiarNombre(original = '') {
  const texto = String(original)
    .replace(/\p{Extended_Pictographic}|\p{Emoji_Modifier}|[\u{1F3FB}-\u{1F3FF}\u20E3]|️|‍|�/gu, ' ')
    .replace(/[()[\]{}|/\\_*.,;:!?¡¿"“”'«»#@+=~^<>]/g, ' ')
    .replace(/\d+\s*(ro|ero|do|to|vo|no|mo|°|º)?(?=\s|$)/gi, ' ')
    .replace(/\d+/g, ' ');
  const nombre = [];
  const nota = [];
  let descripcion = false;
  for (const palabra of texto.split(/\s+/).filter(Boolean)) {
    const limpia = palabra.replace(/^-+|-+$/g, '');
    const clave = sinTildes(limpia.toLowerCase());
    if (!clave) continue;
    if (!descripcion && nombre.length && PARENTESCO.includes(clave)) descripcion = true;
    if (descripcion) {
      nota.push(limpia.toLowerCase());
      continue;
    }
    if (SOBRAN.includes(clave)) continue;
    if (SERVICIOS.includes(clave)) {
      nota.push(limpia.toLowerCase());
      continue;
    }
    nombre.push(nombre.length && CONECTORES.includes(clave) ? clave : capitalizar(limpia));
  }
  // «Mamá de Pía» sin nombre: queda la descripción como nombre, para que se corrija a mano.
  if (!nombre.length && nota.length && PARENTESCO.includes(sinTildes(nota[0]))) {
    return { nombre: capitalizar(nota[0]) + (nota.length > 1 ? ` ${nota.slice(1).map((w) => (CONECTORES.includes(sinTildes(w)) ? w : capitalizar(w))).join(' ')}` : ''), nota: '', revisar: true };
  }
  return { nombre: nombre.join(' ').slice(0, 60), nota: nota.join(' ').slice(0, 80) };
}

/**
 * Teléfono a formato +569XXXXXXXX. Acepta «9 1234 5678», «+56 9 1234 5678», «56912345678», «(09) 1234-5678».
 * Devuelve null si no parece un número válido.
 */
export function normalizarTelefono(t = '') {
  const crudo = String(t).trim();
  let d = crudo.replace(/\D/g, '');
  if (!d) return null;
  if (crudo.startsWith('+') && !d.startsWith('56')) return d.length >= 8 && d.length <= 15 ? `+${d}` : null; // extranjero
  if (d.startsWith('0056')) d = d.slice(2);
  if (d.startsWith('56')) d = d.slice(2);
  if (d.startsWith('09') && d.length === 10) d = d.slice(1);
  if (d.length === 8) d = `9${d}`; // números antiguos de 8 dígitos
  if (d.length === 9 && /^[2-9]/.test(d)) return `+56${d}`;
  return null;
}

/** +56912345678 → +56 9 1234 5678 */
export const mostrarTelefono = (t = '') =>
  /^\+569\d{8}$/.test(t) ? `+56 9 ${t.slice(4, 8)} ${t.slice(8)}` : t;

/** Lee un archivo .vcf (exportado del iPhone o Android). Devuelve [{ original, telefono }]. */
export function leerVcf(texto = '') {
  const lineas = String(texto)
    .replace(/\r\n[ \t]/g, '') // líneas partidas
    .split(/\r?\n/);
  const salida = [];
  let actual = null;
  for (const linea of lineas) {
    const l = linea.trim();
    if (/^BEGIN:VCARD/i.test(l)) actual = { fn: '', n: '', tels: [] };
    else if (/^END:VCARD/i.test(l) && actual) {
      const nombre = actual.fn || actual.n;
      const movil = actual.tels.find((x) => /CELL|MOBILE|IPHONE/i.test(x.tipo)) ?? actual.tels[0];
      if (movil) salida.push({ original: nombre, telefono: movil.valor });
      actual = null;
    } else if (actual) {
      const i = l.indexOf(':');
      if (i < 0) continue;
      const clave = l.slice(0, i).toUpperCase();
      const valor = decodificarQP(clave, l.slice(i + 1));
      const prop = clave.split(';')[0].replace(/^ITEM\d+\./, '');
      if (prop === 'FN') actual.fn = valor.trim();
      else if (prop === 'N') actual.n = valor.split(';').slice(0, 2).reverse().join(' ').trim();
      else if (prop === 'TEL') actual.tels.push({ tipo: clave, valor });
    }
  }
  return salida;
}

function decodificarQP(clave, valor) {
  if (!/QUOTED-PRINTABLE/.test(clave)) return valor;
  try {
    const bytes = valor.replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
    return decodeURIComponent(escape(bytes));
  } catch {
    return valor;
  }
}

/** Lee un .csv simple (Google Contacts o Excel): busca columnas de nombre y teléfono. */
export function leerCsv(texto = '') {
  const filas = String(texto)
    .split(/\r?\n/)
    .filter((f) => f.trim())
    .map((f) => f.split(/[;,](?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim()));
  if (filas.length < 2) return [];
  const cab = filas[0].map((c) => sinTildes(c.toLowerCase()));
  const iNombre = cab.findIndex((c) => /^(name|nombre|first name|given name)/.test(c));
  const iTel = cab.findIndex((c) => /(phone|telefono|celular|movil|numero)/.test(c) && !/type|tipo|label/.test(c));
  const iNota = cab.findIndex((c) => /^(nota|notes?|observacion)/.test(c));
  if (iTel < 0) return [];
  return filas.slice(1).map((f) => ({ original: f[iNombre] ?? '', telefono: f[iTel] ?? '', ...(iNota >= 0 && f[iNota] ? { nota: f[iNota] } : {}) }));
}

/** Prepara una lista para subir: limpia, normaliza y quita repetidos. */
export function prepararContactos(lista) {
  const vistos = new Set();
  return lista.map((c) => {
    const limpio = limpiarNombre(c.original);
    const nombre = limpio.nombre;
    const nota = [c.nota, limpio.nota].filter(Boolean).join(' · ').slice(0, 80);
    const telefono = normalizarTelefono(c.telefono);
    const repetido = telefono ? vistos.has(telefono) : false;
    if (telefono) vistos.add(telefono);
    return { original: c.original, nombre, nota, telefono, valido: Boolean(telefono && nombre), repetido, revisar: Boolean(limpio.revisar) };
  });
}
