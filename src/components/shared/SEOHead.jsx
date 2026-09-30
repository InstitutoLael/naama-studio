import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '../../data/site';

const DEFAULT_DESCRIPTION =
  'Naamá Studio — Beauty & Wellness House en una casa patrimonial de San Miguel, Santiago. Cabello, color, uñas, cejas, faciales, masajes y podología.';

const upsert = (selector, create, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

const meta = (key, content, attr = 'name') =>
  upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, key);
    return m;
  }, { content });

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: SITE.name,
  description: DEFAULT_DESCRIPTION,
  url: SITE.url,
  logo: `${SITE.url}/icon-512.png`,
  image: `${SITE.url}/og-image.jpg`,
  telephone: `+${SITE.phone}`,
  email: SITE.email,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Arcadia 1297',
    addressLocality: 'San Miguel',
    addressRegion: 'Región Metropolitana',
    addressCountry: 'CL',
  },
  geo: { '@type': 'GeoCoordinates', latitude: -33.4969, longitude: -70.6483 },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '17:00' },
  ],
  sameAs: [SITE.instagram],
};

const SEOHead = ({ title, description = DEFAULT_DESCRIPTION, image = '/og-image.jpg' }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} · Naamá Studio` : 'Naamá Studio · Beauty & Wellness House en San Miguel';
    const url = `${SITE.url}${pathname === '/' ? '/' : pathname}`;
    const img = image.startsWith('http') ? image : `${SITE.url}${image}`;

    document.title = fullTitle;
    meta('description', description);
    upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.rel = 'canonical';
      return l;
    }, { href: url });

    meta('og:title', fullTitle, 'property');
    meta('og:description', description, 'property');
    meta('og:url', url, 'property');
    meta('og:image', img, 'property');
    meta('twitter:title', fullTitle);
    meta('twitter:description', description);
    meta('twitter:image', img);

    upsert('script#naama-schema', () => {
      const s = document.createElement('script');
      s.id = 'naama-schema';
      s.type = 'application/ld+json';
      return s;
    }, {});
    document.getElementById('naama-schema').textContent = JSON.stringify(SCHEMA);
  }, [title, description, image, pathname]);

  return null;
};

export default SEOHead;
