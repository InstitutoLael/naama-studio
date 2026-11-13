// Avisos push (Web Push, RFC 8291/8292) sin librerías: todo con WebCrypto.
// La llave VAPID se crea sola la primera vez y queda guardada en D1 (tabla meta): no hay que configurar nada en Cloudflare.

const enc = new TextEncoder();
const b64u = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
export const deB64u = (s) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(t + '='.repeat((4 - (t.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
const unir = (...partes) => {
  const total = partes.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let i = 0;
  for (const p of partes) {
    out.set(p, i);
    i += p.length;
  }
  return out;
};

/** Llaves VAPID del portal (se crean una sola vez). */
export async function llavesVapid(db) {
  const fila = await db.prepare(`SELECT valor FROM meta WHERE clave = 'vapid'`).first();
  if (fila) return JSON.parse(fila.valor);
  const par = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const privada = await crypto.subtle.exportKey('jwk', par.privateKey);
  const publica = b64u(await crypto.subtle.exportKey('raw', par.publicKey));
  const valor = { privada, publica };
  await db
    .prepare(`INSERT INTO meta (clave, valor) VALUES ('vapid', ?) ON CONFLICT(clave) DO NOTHING`)
    .bind(JSON.stringify(valor))
    .run();
  // Si otra petición la creó al mismo tiempo, usamos la que quedó guardada.
  return JSON.parse((await db.prepare(`SELECT valor FROM meta WHERE clave = 'vapid'`).first()).valor);
}

async function jwtVapid(llaves, endpoint) {
  const aud = new URL(endpoint).origin;
  const cabeza = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const cuerpo = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'https://naamastudio.cl' })));
  const llave = await crypto.subtle.importKey('jwk', llaves.privada, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, llave, enc.encode(`${cabeza}.${cuerpo}`));
  return `${cabeza}.${cuerpo}.${b64u(firma)}`;
}

const hkdf = async (sal, ikm, info, bits) => {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: sal, info }, k, bits));
};

/** Cifra el mensaje para una suscripción (aes128gcm, RFC 8291). */
export async function cifrar(sub, texto, { sal = crypto.getRandomValues(new Uint8Array(16)), par } = {}) {
  const uaPublica = deB64u(sub.keys.p256dh);
  const auth = deB64u(sub.keys.auth);
  const efimero = par ?? (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']));
  const asPublica = new Uint8Array(await crypto.subtle.exportKey('raw', efimero.publicKey));
  const ua = await crypto.subtle.importKey('raw', uaPublica, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const secreto = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: ua }, efimero.privateKey, 256));
  const ikm = await hkdf(auth, secreto, unir(enc.encode('WebPush: info\0'), uaPublica, asPublica), 256);
  const cek = await hkdf(sal, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 128);
  const nonce = await hkdf(sal, ikm, enc.encode('Content-Encoding: nonce\0'), 96);
  const llave = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, llave, unir(enc.encode(texto), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]); // 4096
  return unir(sal, rs, new Uint8Array([asPublica.length]), asPublica, cifrado);
}

/** Manda un aviso. Devuelve 'ok', 'borrar' (la suscripción ya no existe) o 'error'. */
export async function enviarPush(env, llaves, sub, datos) {
  try {
    const cuerpo = await cifrar(sub, JSON.stringify(datos));
    const jwt = await jwtVapid(llaves, sub.endpoint);
    const r = await (env.PUSH_FETCH ?? fetch)(sub.endpoint, {
      method: 'POST',
      headers: {
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: '86400',
        Urgency: 'high',
        Authorization: `vapid t=${jwt}, k=${llaves.publica}`,
      },
      body: cuerpo,
    });
    if (r.status === 404 || r.status === 410) return 'borrar';
    return r.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}
