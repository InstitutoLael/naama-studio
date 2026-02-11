import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/GalleryPage.css';

const galleryCategories = ['Todos', 'Corte & Estilo', 'Colorimetría', 'Manicure', 'Pedicure', 'Maquillaje', 'Tratamientos'];

// Placeholder gallery using existing assets + trend descriptions
const galleryItems = [
  { id: 1, src: '/assets/salon-arch.png', cat: 'Corte & Estilo', title: 'Bob Estructurado', specialist: 'Valeria', desc: 'Corte de precisión con textura y movimiento natural.' },
  { id: 2, src: '/assets/labor-hands.png', cat: 'Colorimetría', title: 'Balayage Caramelo', specialist: 'Cami', desc: 'Técnica de mano alzada para un rubio natural y luminoso.' },
  { id: 3, src: '/assets/mirada-bg.png', cat: 'Maquillaje', title: 'Diseño de Mirada', specialist: 'Allison', desc: 'Laminado de cejas + lifting de pestañas para mirada abierta.' },
  { id: 4, src: '/assets/nails-bg.png', cat: 'Manicure', title: 'Semipermanente French', specialist: 'Gaby', desc: 'Acabado limpio con línea de sonrisa perfecta.' },
  { id: 5, src: '/assets/wellness-bg.png', cat: 'Tratamientos', title: 'Masaje Térmico', specialist: 'Vivy', desc: 'Sesión de descompresión profunda con piedras calientes.' },
  { id: 6, src: '/assets/hero-bg.png', cat: 'Pedicure', title: 'Pedicure Clínico', specialist: 'Gaby', desc: 'Tratamiento podológico con higiene hospitalaria.' },
  { id: 7, src: '/assets/salon-arch.png', cat: 'Corte & Estilo', title: 'Pixie Texturizado', specialist: 'Valeria', desc: 'Corte corto con capas internas para volumen natural.' },
  { id: 8, src: '/assets/labor-hands.png', cat: 'Colorimetría', title: 'Reflejos Ceniza', specialist: 'Cami', desc: 'Tonos fríos con técnica de papel para máxima definición.' },
  { id: 9, src: '/assets/mirada-bg.png', cat: 'Maquillaje', title: 'Glam Natural', specialist: 'Allison', desc: 'Base impecable con acabado luminoso para eventos.' },
  { id: 10, src: '/assets/nails-bg.png', cat: 'Manicure', title: 'Nail Art Minimalista', specialist: 'Gaby', desc: 'Diseños geométricos finos en tonos nude.' },
  { id: 11, src: '/assets/wellness-bg.png', cat: 'Tratamientos', title: 'Facial Hidratante', specialist: 'Vivy', desc: 'Protocolo de limpieza profunda + hidratación con ácido hialurónico.' },
  { id: 12, src: '/assets/hero-bg.png', cat: 'Pedicure', title: 'Spa Pedicure', specialist: 'Gaby', desc: 'Exfoliación, hidratación y esmaltado premium.' }
];

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const filtered = activeFilter === 'Todos' 
    ? galleryItems 
    : galleryItems.filter(item => item.cat === activeFilter);

  const openLightbox = (item) => setLightbox(item);
  const closeLightbox = () => setLightbox(null);

  const navigateLightbox = (dir) => {
    const currentIdx = filtered.findIndex(i => i.id === lightbox.id);
    const nextIdx = (currentIdx + dir + filtered.length) % filtered.length;
    setLightbox(filtered[nextIdx]);
  };

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightbox && navigateLightbox(1);
      if (e.key === 'ArrowLeft') lightbox && navigateLightbox(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, filtered]);

  return (
    <div className="gallery_page">
      <SEOHead 
        title="Galería de Trabajos" 
        description="Explora nuestro portfolio de trabajos: cortes, colorimetría, manicure, maquillaje y más." 
      />

      <header className="gallery_header reveal">
        <span className="world_category_label">Portfolio</span>
        <h1 className="gallery_title serif">Nuestra <span className="text_clay">Obra</span></h1>
        <p className="world_description">
          Cada servicio es una pieza de ingeniería del cuidado. Aquí mostramos las tendencias y técnicas que definen nuestro trabajo.
        </p>
      </header>

      {/* Filter Tabs */}
      <div className="gallery_filters container reveal delay-1">
        {galleryCategories.map(cat => (
          <button
            key={cat}
            className={`filter_btn ${activeFilter === cat ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat)}
            aria-label={`Filtrar por ${cat}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="gallery_masonry container reveal delay-2">
        {filtered.map((item, idx) => (
          <div 
            key={item.id} 
            className={`gallery_item ${idx % 5 === 0 ? 'tall' : ''}`}
            onClick={() => openLightbox(item)}
            role="button"
            tabIndex={0}
            aria-label={`Ver ${item.title}`}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(item)}
          >
            <img 
              src={item.src} 
              alt={item.title} 
              loading="lazy"
              width="400"
              height="500"
            />
            <div className="gallery_item_overlay">
              <span className="gallery_item_cat">{item.cat}</span>
              <h3 className="gallery_item_title serif">{item.title}</h3>
              <span className="gallery_item_specialist">por {item.specialist}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div className="lightbox_overlay" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Vista ampliada">
          <div className="lightbox_content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox_close" onClick={closeLightbox} aria-label="Cerrar">
              <X size={24} strokeWidth={1} />
            </button>
            <button className="lightbox_nav lightbox_prev" onClick={() => navigateLightbox(-1)} aria-label="Imagen anterior">
              <ChevronLeft size={30} strokeWidth={1} />
            </button>
            <div className="lightbox_image_box">
              <img src={lightbox.src} alt={lightbox.title} />
            </div>
            <button className="lightbox_nav lightbox_next" onClick={() => navigateLightbox(1)} aria-label="Imagen siguiente">
              <ChevronRight size={30} strokeWidth={1} />
            </button>
            <div className="lightbox_info">
              <span className="gallery_item_cat">{lightbox.cat}</span>
              <h3 className="serif" style={{ fontSize: '1.8rem', margin: '10px 0' }}>{lightbox.title}</h3>
              <p className="lightbox_desc">{lightbox.desc}</p>
              <span className="gallery_item_specialist">Realiza: {lightbox.specialist}</span>
            </div>
          </div>
        </div>
      )}

      <section className="container section-padding text-center reveal">
        <p className="world_item_tag" style={{ marginBottom: '20px' }}>Próximo Paso</p>
        <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '20px' }}>¿Te gustaría reservar?</h2>
        <a href="/reservar" className="notfound_btn" aria-label="Reservar sesión">Agendar Sesión</a>
      </section>
    </div>
  );
};

export default GalleryPage;
