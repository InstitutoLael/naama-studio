// Copia las plantillas de /emails a portal-api/plantillas-correo.js para que el servidor las use.
// Correr después de cambiar un correo: node scripts/plantillas-correo.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const leer = (f) => readFileSync(new URL(`../emails/${f}`, import.meta.url), 'utf8');
const salida = `// Generado por scripts/plantillas-correo.mjs a partir de /emails. No editar a mano.
export const PLANTILLAS = ${JSON.stringify(
  {
    giftCard: leer('gift-card.html'),
    bienvenida: leer('bienvenida-portal.html'),
    contacto: leer('respuesta-contacto.html'),
  },
  null,
  2,
)};
`;
writeFileSync(new URL('../portal-api/plantillas-correo.js', import.meta.url), salida);
console.log('Plantillas de correo listas.');
