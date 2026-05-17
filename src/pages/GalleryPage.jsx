import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead';
import InstagramReels from '../components/sections/InstagramReels';
import '../styles/Global.css';
import '../styles/GalleryPage.css';

const galleryCategories = ['Todos', 'Corte & Estilo', 'Colorimetría', 'Manicure', 'Pedicure', 'Maquillaje', 'Tratamientos'];

// Placeholder gallery using existing assets + trend descriptions
export const galleryItems = [
  // Agregar items así cuando tengas fotos:
  // { 
  //   id: 1, 
  //   src: '/galeria/balayage-valeria-01.jpg', 
  //   cat: 'Colorimetría', 
  //   title: 'Balayage Caramelo', 
  //   specialist: 'Valeria', 
  //   desc: 'Técnica de mano alzada para un rubio natural y luminoso.' 
  // },
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

      {/* Masonry Grid o Estado Vacío */}
      {galleryItems.length === 0 ? (
        <div className="gallery_empty container reveal delay-2">
          <p className="empty_title serif">Próximamente — Nuestros trabajos</p>
          <p className="empty_text">
            Sigue nuestra cuenta <a href="https://www.instagram.com/naamastudio_" target="_blank" rel="noopener noreferrer">@naamastudio_</a> en Instagram para ver los trabajos más recientes.
          </p>
        </div>
      ) : (
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
      )}

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
              <a
                href={`https://wa.me/56979520623?text=Hola! Vi el trabajo "${lightbox.title}" en la galería de Naamá Studio y me gustaría agendar algo similar. ¿Tienen disponibilidad?`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '20px',
                  background: '#25D366',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '2px',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  textDecoration: 'none'
                }}
                aria-label="Agendar este servicio por WhatsApp"
              >
                📲 Quiero algo así — Agendar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <section className="container section-padding text-center reveal">
        <p className="world_item_tag" style={{ marginBottom: '20px' }}>Próximo Paso</p>
        <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '20px' }}>¿Te gustaría reservar?</h2>
        <a href="/reservar" className="notfound_btn" aria-label="Reservar sesión">Agendar Sesión</a>
      </section>
      {/* Real Instagram Reels */}
      <InstagramReels 
        reels={[
          {
            url: "https://www.instagram.com/reel/DU67OwaDr2-/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
            title: "Resultados increíbles con técnica Balayage 🤎",
            category: "Colorimetría"
          },
          {
            url: "https://www.instagram.com/reel/DTvTUX5jnvw/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
            title: "Proceso de iluminación y matiz",
            category: "Corte & Estilo"
          },
          {
            url: "https://www.instagram.com/reel/DRhY5Z9jtAg/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
            title: "Transformación radical y saludable ✨",
            category: "Tratamientos"
          },
          {
            url: "https://www.instagram.com/reel/DR4nT54jlQ-/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
            title: "Rubio perfecto sin dañar la fibra capilar",
            category: "Colorimetría"
          },
          {
            url: "https://www.instagram.com/reel/DPO7EA0Dphm/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
            title: "Expectativa vs Realidad 😂 (Humor Salón)",
            category: "Naamá Vibe"
          }
        ]}
      />
    </div>
  );
};

export default GalleryPage;
