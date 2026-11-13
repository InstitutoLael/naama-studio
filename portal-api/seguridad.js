// Contraseñas, tokens y comparaciones seguras. Solo WebCrypto: funciona igual en Cloudflare y en Node.

const enc = new TextEncoder();
const ITERACIONES = 100000; // máximo que acepta PBKDF2 en Cloudflare Workers

const aHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const deHex = (hex) => new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));

export const bytesAleatorios = (n) => crypto.getRandomValues(new Uint8Array(n));

/** Devuelve { hash, sal } en hexadecimal. PBKDF2-SHA256 con sal propia por persona. */
export async function hashClave(clave, salHex = aHex(bytesAleatorios(16))) {
  const llave = await crypto.subtle.importKey('raw', enc.encode(clave), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: deHex(salHex), iterations: ITERACIONES },
    llave,
    256,
  );
  return { hash: aHex(bits), sal: salHex };
}

/** Comparación en tiempo constante (no revela en qué carácter difiere). */
export function igualSeguro(a = '', b = '') {
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let dif = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) dif |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return dif === 0;
}

export async function verificarClave(clave, hash, sal) {
  const calc = await hashClave(clave, sal);
  return igualSeguro(calc.hash, hash);
}

export async function sha256(texto) {
  return aHex(await crypto.subtle.digest('SHA-256', enc.encode(texto)));
}

export const nuevoToken = () => aHex(bytesAleatorios(32));

// Sin letras que se confunden (0/O, 1/l/I) para dictarla por WhatsApp sin errores.
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';
export function claveTemporal() {
  const b = bytesAleatorios(10);
  const s = [...b].map((x) => ALFABETO[x % ALFABETO.length]).join('');
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}
