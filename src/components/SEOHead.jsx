import React from 'react';

const SEOHead = ({ title, description }) => {
  React.useEffect(() => {
    document.title = `${title} | Naamá Studio`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || 'Naamá Studio - Belleza, Bienestar & Armonía en San Miguel, Santiago.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description || 'Naamá Studio - Belleza, Bienestar & Armonía en San Miguel, Santiago.';
      document.head.appendChild(meta);
    }
  }, [title, description]);

  return null;
};

export default SEOHead;
