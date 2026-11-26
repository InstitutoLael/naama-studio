/**
 * Después de `vite build`:
 *  1. Crea un HTML por ruta con su título, descripción, imagen y datos estructurados, para que
 *     Google y las vistas previas de WhatsApp/Instagram muestren la información correcta.
 *  2. Escribe dentro de <div id="root"> una versión en texto de cada página (título, descripción,
 *     servicios con precios, dirección y horario). Google la lee aunque no ejecute JavaScript;
 *     React la reemplaza en cuanto carga, así que las personas no la ven.
 *  3. Genera sitemap.xml.
 * Cloudflare Pages sirve /servicios desde servicios.html; lo demás cae en index.html (SPA).
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { mundos, servicesForMundo } from '../src/data/categories.js';
import { servicesData } from '../src/data/servicesData.js';
import { SITE as S, HOURS } from '../src/data/site.js';
import { FAQ } from '../src/data/faq.js';
import { BUSINESS_SCHEMA, DEFAULT_DESCRIPTION, DEFAULT_TITLE, faqSchema } from '../src/data/schema.js';

const SITE = S.url;
const DIST = 'dist';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const routes = [
  {
    path: '/',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    h1: 'Salón de belleza y bienestar en San Miguel, Santiago',
    intro: 'Naamá Studio es una casa patrimonial en Arcadia 1297, San Miguel, dedicada a la belleza y el bienestar. No vendemos servicios, custodiamos pausas.',
    faq: true,
  },
  {
    path: '/servicios',
    title: 'Servicios y precios · Salón de belleza en San Miguel · Naamá Studio',
    description: 'Precios de cabello, color, uñas, cejas, pestañas, depilación, faciales, masajes y podología en Naamá Studio, San Miguel. Reserva por WhatsApp.',
    h1: 'Servicios y precios',
    intro: 'Todos nuestros servicios, con precios claros, en nuestra casa de Arcadia 1297, San Miguel.',
    services: servicesData,
  },
  ...mundos.map((m) => ({
    path: `/servicios/${m.id}`,
    title: `${m.name} en San Miguel · Naamá Studio`,
    description: `${m.description} Precios y reservas en Naamá Studio, Arcadia 1297, San Miguel.`,
    image: `/img/${m.photo}-960.webp`,
    h1: `${m.name} en San Miguel`,
    intro: m.description,
    services: servicesForMundo(servicesData, m),
  })),
  {
    path: '/equipo',
    title: 'Nuestro equipo · Naamá Studio, San Miguel',
    description: 'Conoce a las especialistas de Naamá Studio: color, cabello, uñas, maquillaje y bienestar en San Miguel.',
    image: '/img/equipo-1600.webp',
    h1: 'Nuestro equipo',
    intro: 'Las especialistas que te reciben en Naamá Studio, San Miguel.',
  },
  {
    path: '/galeria',
    title: 'Galería de trabajos · Naamá Studio, San Miguel',
    description: 'Trabajos reales de uñas, color, peinados y eventos, y rincones de nuestra casa patrimonial en San Miguel.',
    image: '/img/unas-violeta-960.webp',
    h1: 'Galería de trabajos',
    intro: 'Trabajos reales hechos en Naamá Studio y rincones de nuestra casa.',
  },
  {
    path: '/reservar',
    title: 'Reservar hora · Naamá Studio, San Miguel',
    description: 'Elige servicio, especialista, día y hora, y confirma tu reserva por WhatsApp.',
    h1: 'Reserva tu hora',
    intro: 'Elige servicio, especialista, día y hora, y confirma por WhatsApp.',
  },
  {
    path: '/gift-cards',
    title: 'Gift cards · Naamá Studio, San Miguel',
    description: 'Regala una pausa: gift cards digitales de belleza y bienestar en Naamá Studio, San Miguel.',
    h1: 'Gift cards',
    intro: 'Regala una pausa con una gift card digital de Naamá Studio.',
  },
  {
    path: '/empresas',
    title: 'Bienestar para empresas · Naamá Studio',
    description: 'Jornadas de belleza y bienestar para equipos, en el salón o en tu oficina, y gift cards corporativas.',
    h1: 'Bienestar para empresas',
    intro: 'Jornadas de cuidado para equipos, en el salón o en tu oficina.',
  },
  {
    path: '/contacto',
    title: 'Contacto y cómo llegar · Naamá Studio, San Miguel',
    description: 'Arcadia 1297, San Miguel, Santiago. Lunes a sábado 10:30–19:30. WhatsApp +56 9 7952 0623.',
    image: '/img/casa-fachada-1600.webp',
    h1: 'Contacto y cómo llegar',
    intro: 'Estamos en Arcadia 1297, San Miguel, a pasos del metro El Llano.',
  },
  {
    path: '/preguntas',
    title: 'Preguntas frecuentes · Naamá Studio, San Miguel',
    description: 'Horario, reservas, pagos, gift cards y cómo llegar a Naamá Studio en Arcadia 1297, San Miguel.',
    h1: 'Preguntas frecuentes',
    intro: 'Lo que más nos preguntan antes de venir.',
    faq: true,
  },
  {
    path: '/portal',
    title: 'Portal del equipo · Naamá Studio',
    description: 'Acceso privado para el equipo de Naamá Studio.',
    h1: 'Portal del equipo',
    intro: 'Acceso privado para el equipo de Naamá Studio.',
    privada: true,
  },
];

const nav = [
  ['/', 'Inicio'],
  ['/servicios', 'Servicios y precios'],
  ...mundos.map((m) => [`/servicios/${m.id}`, m.name]),
  ['/galeria', 'Galería'],
  ['/equipo', 'Equipo'],
  ['/reservar', 'Reservar'],
  ['/gift-cards', 'Gift cards'],
  ['/contacto', 'Contacto'],
  ['/preguntas', 'Preguntas frecuentes'],
];

const staticBody = (r) => {
  const services = (r.services ?? [])
    .map((s) => `<li>${esc(s.name)}${s.time ? ` · ${esc(s.time)}` : ''} · ${/sin costo|gratis/i.test(s.price) ? 'Sin costo' : '$' + esc(s.price)}</li>`)
    .join('');
  const faq = r.faq ? `<h2>Preguntas frecuentes</h2>${FAQ.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}` : '';
  return `<div class="seo-static"><header><a href="/">Naamá Studio</a><nav>${nav
    .map(([href, label]) => `<a href="${href}">${esc(label)}</a>`)
    .join(' · ')}</nav></header><main><h1>${esc(r.h1)}</h1><p>${esc(r.intro)}</p>${
    services ? `<h2>Servicios y precios</h2><ul>${services}</ul>` : ''
  }${faq}</main><footer><p>${esc(S.name)} · ${esc(S.address)}, Santiago · ${HOURS.map((h) => `${esc(h.label)}: ${esc(h.value)}`).join(' · ')} · WhatsApp <a href="https://wa.me/${S.phone}">${esc(
    S.phoneDisplay,
  )}</a> · <a href="${esc(S.instagram)}">Instagram ${esc(S.instagramHandle)}</a></p></footer></div>`;
};

const template = await readFile(path.join(DIST, 'index.html'), 'utf8');

// ── Velocidad: cada página precarga su foto principal, su código y la letra, para que no esperen a React ──
const fotos = JSON.parse(await readFile(new URL('../src/data/photos.json', import.meta.url), 'utf8'));
const assets = await readdir(path.join(DIST, 'assets'));
const asset = (prefijo, ext) => assets.find((f) => f.startsWith(prefijo + '-') && f.endsWith(ext));
const letra = assets.find((f) => /^inter-tight-latin-wght-normal-.*\.woff2$/.test(f));
const PAGINA = {
  '/': { foto: ['cabello-balayage', '(min-width: 1024px) 22vw, 50vw'] },
  '/servicios': { codigo: 'ServicesPage', foto: ['casa-sala', '100vw'], soloCel: true },
  '/reservar': { codigo: 'BookingFlow', foto: ['unas-burdeo-floral', '100vw'], soloCel: true },
  '/galeria': { codigo: 'GalleryPage', foto: ['unas-burdeo-floral', '(min-width: 1024px) 1200px, 92vw'] },
  '/empresas': { codigo: 'EmpresasPage', foto: ['casa-sala', '(min-width: 1024px) 22vw, 46vw'] },
  '/equipo': { codigo: 'TeamPage' },
  '/contacto': { codigo: 'ContactPage' },
  '/gift-cards': { codigo: 'GiftCardsPage' },
  '/preguntas': { codigo: 'PreguntasPage' },
};
const dependencias = async (archivo, vistos = new Set()) => {
  if (!archivo || vistos.has(archivo)) return vistos;
  vistos.add(archivo);
  const js = await readFile(path.join(DIST, 'assets', archivo), 'utf8');
  for (const m of js.matchAll(/from\s*"\.\/([^"]+\.js)"/g)) if (!m[1].startsWith('index-')) await dependencias(m[1], vistos);
  return vistos;
};
const precargas = async (ruta) => {
  const p = PAGINA[ruta.startsWith('/servicios/') ? '/servicios-mundo' : ruta] ?? (ruta.startsWith('/servicios/') ? { codigo: 'WorldPage' } : null);
  const l = [];
  if (letra) l.push(`<link rel="preload" href="/assets/${letra}" as="font" type="font/woff2" crossorigin />`);
  if (!p) return l;
  if (p.foto && fotos[p.foto[0]]) {
    const [nombre, sizes] = p.foto;
    const set = fotos[nombre].widths.map((w) => `/img/${nombre}-${w}.avif ${w}w`).join(', ');
    l.push(`<link rel="preload" as="image" type="image/avif" fetchpriority="high" imagesrcset="${set}" imagesizes="${sizes}"${p.soloCel ? ' media="(max-width: 1023px)"' : ''} />`);
  }
  if (p.codigo) {
    for (const f of await dependencias(asset(p.codigo, '.js'))) l.push(`<link rel="modulepreload" href="/assets/${f}" />`);
    const css = asset(p.codigo, '.css');
    if (css) l.push(`<link rel="preload" href="/assets/${css}" as="style" />`);
  }
  return l;
};

const render = async (r) => {
  let html = template;
  if (!r.privada) html = html.replace('</head>', `    ${(await precargas(r.path)).join('\n    ')}\n  </head>`);
  const url = `${SITE}${r.path}`;
  const set = (re, value) => (html = html.replace(re, (m, a, _b, c) => `${a}${esc(value)}${c}`));
  set(/(<title>)([^<]*)(<\/title>)/, r.title);
  set(/(<meta property="og:title" content=")([^"]*)(")/, r.title);
  set(/(<link rel="canonical" href=")([^"]*)(")/, url);
  set(/(<meta property="og:url" content=")([^"]*)(")/, url);
  set(/(<meta name="description" content=")([^"]*)(")/, r.description);
  set(/(<meta property="og:description" content=")([^"]*)(")/, r.description);
  if (r.image) {
    set(/(<meta property="og:image" content=")([^"]*)(")/, `${SITE}${r.image}`);
    set(/(<meta name="twitter:image" content=")([^"]*)(")/, `${SITE}${r.image}`);
  }
  const ld = [`<script type="application/ld+json" id="naama-schema">${JSON.stringify(BUSINESS_SCHEMA)}</script>`];
  if (r.faq) ld.push(`<script type="application/ld+json" id="naama-faq">${JSON.stringify(faqSchema(FAQ))}</script>`);
  html = html.replace('</head>', `    ${ld.join('\n    ')}\n  </head>`);
  if (r.privada) {
    // Zona privada: que Google no la indexe y sin texto de la web adentro.
    // App instalable del portal: su propio manifest e íconos para iPhone y Android.
    html = html
      .replace('<link rel="manifest" href="/manifest.json" />', '<link rel="manifest" href="/portal-manifest.webmanifest" />')
      .replace('<meta name="theme-color" content="#17110e" />', '<meta name="theme-color" content="#f8f3ed" />')
      .replace('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />', '<link rel="apple-touch-icon" href="/app-naama-apple.png" />')
      .replace(
        '</head>',
        [
          '    <meta name="robots" content="noindex, nofollow" />',
          '    <meta name="apple-mobile-web-app-capable" content="yes" />',
          '    <meta name="mobile-web-app-capable" content="yes" />',
          '    <meta name="apple-mobile-web-app-title" content="Naamá" />',
          '    <meta name="apple-mobile-web-app-status-bar-style" content="default" />',
          '  </head>',
        ].join('\n'),
      );
    return html;
  }
  html = html.replace('<div id="root"></div>', `<div id="root">${staticBody(r)}</div>`);
  return html;
};

for (const route of routes) {
  const file = route.path === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${route.path.slice(1)}.html`);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, await render(route));
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .filter((r) => r.path !== '/reservar' && !r.privada)
  .map((r) => `  <url><loc>${SITE}${r.path}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`;
await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
console.log(`postbuild: ${routes.length} páginas con texto estático y datos estructurados + sitemap.xml`);
