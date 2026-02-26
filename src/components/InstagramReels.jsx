import React from 'react';
import '../styles/InstagramReels.css';

// Un utilitario simple para extraer el ID del reel desde el link de Instagram
const getReelId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

const InstagramReels = ({ reels }) => {
  if (!reels || reels.length === 0) return null;

  return (
    <div className="reels_container reveal">
      <h2 className="reels_title serif text-center">En Movimiento</h2>
      <p className="reels_subtitle text-center">Descubre nuestro trabajo y esencia en video.</p>
      
      <div className="reels_grid">
        {reels.map((reel, index) => {
          const reelId = getReelId(reel.url);
          if (!reelId) return null;

          return (
            <div key={index} className="reel_card">
              <a 
                href={reel.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="reel_link"
                aria-label={`Ver reel: ${reel.title}`}
              >
                <div className="reel_video_placeholder">
                  {/* Para no afectar la performance cargando iframes de IG nativos,
                      usamos la imagen de miniatura pública de IG (hack) o simplemente
                      un hermoso diseño de tarjeta con un botón de Play */}
                  <img 
                    src={`https://www.instagram.com/p/${reelId}/media/?size=l`} 
                    alt={reel.title}
                    className="reel_thumbnail"
                    onError={(e) => {
                      // Fallback si IG bloquea la imagen por CORS
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="reel_fallback_gradient" style={{ display: 'none' }}>
                     <svg viewBox="0 0 24 24" fill="white" width="40" height="40">
                       <path d="M8 5v14l11-7z"/>
                     </svg>
                  </div>
                  <div className="reel_play_overlay">
                    <div className="play_button">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="reel_info">
                  <span className="reel_category">{reel.category}</span>
                  <h3 className="reel_card_title">{reel.title}</h3>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstagramReels;
