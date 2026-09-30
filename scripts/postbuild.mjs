/**
 * Después de `vite build`:
 *  1. Crea un HTML por ruta con su título, descripción e imagen, para que Google y las
 *     vistas previas de WhatsApp/Instagram muestren la información correcta de cada página.
 *  2. Genera sitemap.xml.
 * Cloudflare Pages sirve /servicios desde servicios.html; lo demás cae en index.html (SPA).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { mundos } from '../src/data/categories.js';

const SITE = 'https://naamastudio.cl';
const DIST = 'dist';

const routes = [
  { path: '/', title: 'Naamá Studio · Beauty & Wellness House en San Miguel' },
  {
    path: '/servicios',
    title: 'Servicios & Precios · Naamá Studio',
    description: 'Cabello, color, uñas, cejas, pestañas, depilación, faciales, masajes y podología en San Miguel, con precios claros.',
  },
  ...mundos.map((m) => ({
    path: `/servicios/${m.id}`,
    title: `${m.name} · Naamá Studio`,
    description: `${m.description} Precios y reservas en Naamá Studio, San Miguel.`,
    image: `/img/${m.photo}-960.webp`,
  })),
  { path: '/equipo', title: 'Nuestro Equipo · Naamá Studio', description: 'Conoce a las especialistas de Naamá Studio en San Miguel.', image: '/img/equipo-1600.webp' },
  { path: '/galeria', title: 'Galería · Naamá Studio', description: 'Trabajos reales de uñas, color y cabello, y rincones de nuestra casa en San Miguel.', image: '/img/unas-burdeo-oro-960.webp' },
  { path: '/reservar', title: 'Reservar · Naamá Studio', description: 'Elige servicio, especialista, día y hora, y confirma por WhatsApp.' },
  { path: '/gift-cards', title: 'Gift Cards · Naamá Studio', description: 'Regala una experiencia de belleza y bienestar en Naamá Studio.' },
  { path: '/empresas', title: 'Empresas · Naamá Studio', description: 'Bienestar corporativo: jornadas en el salón o en tu oficina y gift cards corporativas.' },
  { path: '/contacto', title: 'Contacto · Naamá Studio', description: 'Arcadia 1297, San Miguel, Santiago. Horarios, WhatsApp e Instagram.' },
];

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const template = await readFile(path.join(DIST, 'index.html'), 'utf8');

const render = ({ path: p, title, description, image }) => {
  let html = template;
  const url = `${SITE}${p}`;
  const set = (re, value) => (html = html.replace(re, (m, a, _b, c) => `${a}${escape(value)}${c}`));
  set(/(<title>)([^<]*)(<\/title>)/, title);
  set(/(<meta property="og:title" content=")([^"]*)(")/, title);
  set(/(<link rel="canonical" href=")([^"]*)(")/, url);
  set(/(<meta property="og:url" content=")([^"]*)(")/, url);
  if (description) {
    set(/(<meta name="description" content=")([^"]*)(")/, description);
    set(/(<meta property="og:description" content=")([^"]*)(")/, description);
  }
  if (image) {
    set(/(<meta property="og:image" content=")([^"]*)(")/, `${SITE}${image}`);
    set(/(<meta name="twitter:image" content=")([^"]*)(")/, `${SITE}${image}`);
  }
  return html;
};

for (const route of routes) {
  if (route.path === '/') continue;
  const file = path.join(DIST, `${route.path.slice(1)}.html`);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, render(route));
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .filter((r) => r.path !== '/reservar')
  .map((r) => `  <url><loc>${SITE}${r.path}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`;
await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
console.log(`postbuild: ${routes.length - 1} páginas + sitemap.xml`);
