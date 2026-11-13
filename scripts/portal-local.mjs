// Servidor local para probar el portal sin Cloudflare: sirve dist/ y la API real con SQLite en memoria.
// Uso: npm run build && node scripts/portal-local.mjs  → http://localhost:8788/portal
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { crearD1 } from '../tests/d1-memoria.mjs';
import { manejar } from '../portal-api/router.js';

const env = { DB: crearD1(), SETUP_SECRET: process.env.SETUP_SECRET ?? 'prueba-local' };

// Planilla de mentira para probar «Anotar servicios» sin Google: pide la fila al portal como lo haría el Apps Script.
let filaDemo = 54;
env.PLANILLA_FETCH = async (_url, opciones) => {
  const { token } = JSON.parse(opciones.body);
  const r = await manejar(new Request(`http://localhost:8788/api/portal/planilla/fila/${token}`), env);
  if (!r.ok) return new Response(JSON.stringify({ ok: false, error: 'Fila no encontrada' }));
  return new Response(JSON.stringify({ ok: true, hoja: 'INGRESO NOV 26', fila: filaDemo++ }));
};
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2' };

const archivo = async (p) => {
  for (const c of [p, `${p}.html`, path.join(p, 'index.html')]) {
    try {
      if ((await stat(c)).isFile()) return c;
    } catch {
      // sigue probando
    }
  }
  return null;
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:8788');
  if (url.pathname.startsWith('/api/portal')) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const headers = new Headers(req.headers);
    // En local el navegador manda Origin http://localhost:8788; la API compara con la misma URL.
    const r = await manejar(
      new Request(url, { method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined }),
      env,
    );
    const h = Object.fromEntries(r.headers);
    // Las cookies «Secure» no viajan por http salvo en localhost (Chrome lo permite).
    res.writeHead(r.status, h).end(Buffer.from(await r.arrayBuffer()));
    return;
  }
  const destino =
    (await archivo(path.join('dist', url.pathname))) ??
    (url.pathname.startsWith('/portal') ? 'dist/portal.html' : 'dist/index.html');
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(destino)] ?? 'application/octet-stream' }).end(await readFile(destino));
}).listen(8788, () => console.log('Portal local en http://localhost:8788/portal'));
