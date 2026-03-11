import React from 'react';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ title, description, image }) => {
  const location = useLocation();
  const baseUrl = 'https://naamastudio.cl';
  const fullUrl = `${baseUrl}${location.pathname}`;
  const fullTitle = `${title} | Naamá Studio`;
  const fullDescription = description || 'Naamá Studio - Belleza, Bienestar & Armonía en San Miguel, Santiago.';
  const ogImage = image || `${baseUrl}/assets/naama-studio.png`;

  React.useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta description
    setMeta('description', fullDescription);

    // Canonical
    setLink('canonical', fullUrl);

    // Open Graph
    setMetaProperty('og:title', fullTitle);
    setMetaProperty('og:description', fullDescription);
    setMetaProperty('og:url', fullUrl);
    setMetaProperty('og:image', ogImage);
    setMetaProperty('og:type', 'website');
    setMetaProperty('og:site_name', 'Naamá Studio');
    setMetaProperty('og:locale', 'es_CL');

    // Twitter Cards
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', fullTitle);
    setMetaName('twitter:description', fullDescription);
    setMetaName('twitter:image', ogImage);

    // Schema.org JSON-LD
    updateJsonLd();
  }, [title, description, location.pathname]);

  const setMeta = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.name = name;
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setMetaName = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setMetaProperty = (property, content) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setLink = (rel, href) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  };

  const updateJsonLd = () => {
    const id = 'naama-schema';
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    const schema = {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "BeautySalon"],
      "name": "Naamá Studio",
      "description": "Gracia, Pulcritud y Descanso. La cuna de la ingeniería estética y hospitalaria en Santiago.",
      "url": baseUrl,
      "logo": `${baseUrl}/assets/naama-studio.png`,
      "image": ogImage,
      "telephone": "+56979520623",
      "email": "naamastudiospa@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Arcadia 1297",
        "addressLocality": "San Miguel",
        "addressRegion": "Santiago",
        "addressCountry": "CL"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -33.4969,
        "longitude": -70.6483
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "19:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "09:00",
          "closes": "17:00"
        }
      ],
      "priceRange": "$$",
      "sameAs": [
        "https://www.instagram.com/naamastudio_/"
      ]
    };

    script.textContent = JSON.stringify(schema);
  };

  return null;
};

export default SEOHead;
