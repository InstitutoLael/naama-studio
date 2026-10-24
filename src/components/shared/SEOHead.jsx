import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '../../data/site';
import { BUSINESS_SCHEMA, DEFAULT_DESCRIPTION, DEFAULT_TITLE, faqSchema } from '../../data/schema';

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

const SEOHead = ({ title, description = DEFAULT_DESCRIPTION, image = '/og-image.jpg', faq }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} · Naamá Studio` : DEFAULT_TITLE;
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
    document.getElementById('naama-schema').textContent = JSON.stringify(BUSINESS_SCHEMA);

    // Preguntas frecuentes (solo en las páginas que las muestran)
    const old = document.getElementById('naama-faq');
    if (old) old.remove();
    if (faq?.length) {
      const f = document.createElement('script');
      f.id = 'naama-faq';
      f.type = 'application/ld+json';
      f.textContent = JSON.stringify(faqSchema(faq));
      document.head.appendChild(f);
    }
  }, [title, description, image, pathname, faq]);

  return null;
};

export default SEOHead;
