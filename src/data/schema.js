// Datos estructurados (schema.org) del negocio. Los usa SEOHead (en el navegador)
// y scripts/postbuild.mjs (en el HTML estático que lee Google sin ejecutar JavaScript).
import { SITE } from './site.js';

export const DEFAULT_TITLE = 'Salón de belleza en San Miguel, Santiago · Naamá Studio';
export const DEFAULT_DESCRIPTION =
  'Salón de belleza y bienestar en una casa patrimonial de San Miguel, Santiago. Cabello, color, uñas, cejas, pestañas, faciales, masajes y podología. Lunes a sábado 10:30–19:30. Reserva por WhatsApp.';

export const BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  '@id': `${SITE.url}/#salon`,
  name: SITE.name,
  alternateName: 'Naamá Studio · Salón de belleza San Miguel',
  description: DEFAULT_DESCRIPTION,
  url: SITE.url,
  logo: `${SITE.url}/icon-512.png`,
  image: [`${SITE.url}/og-image.jpg`, `${SITE.url}/img/casa-fachada-1600.webp`],
  telephone: `+${SITE.phone}`,
  email: SITE.email,
  priceRange: '$$',
  currenciesAccepted: 'CLP',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Arcadia 1297',
    addressLocality: 'San Miguel',
    addressRegion: 'Región Metropolitana',
    addressCountry: 'CL',
  },
  geo: { '@type': 'GeoCoordinates', latitude: -33.4969, longitude: -70.6483 },
  hasMap: SITE.mapsUrl,
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:30',
      closes: '19:30',
    },
  ],
  areaServed: ['San Miguel', 'San Joaquín', 'La Cisterna', 'Pedro Aguirre Cerda', 'Santiago', 'La Granja'].map((name) => ({
    '@type': 'City',
    name,
  })),
  knowsLanguage: 'es',
  sameAs: [SITE.instagram],
};

export const faqSchema = (faq) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
