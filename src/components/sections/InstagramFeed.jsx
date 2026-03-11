import React from 'react';
import { useInstagramFeed } from '../../hooks/useInstagramFeed';
import '../../styles/InstagramFeed.css';

const InstagramFeed = () => {
  // Use environment variable for the token
  const token = import.meta.env.VITE_INSTAGRAM_TOKEN;
  const { posts, loading, error } = useInstagramFeed(token);

  if (loading) {
    return (
      <div className="instagram_feed_container reveal">
         <div className="instagram_grid skeleton_grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="insta_item skeleton_item"></div>
            ))}
         </div>
      </div>
    );
  }

  if (error) {
    console.warn("Instagram feed error, showing fallback."); 
    // The hook returns fallback posts on error, so we don't need special UI handling here, 
    // unless posts is empty.
  }

  return (
    <div className="instagram_feed_container reveal">
      <div className="container">
        <span className="essence_label">Instagram</span>
        <h2 className="serif instagram_heading">Síguenos en <span className="text_clay">@naamastudio_</span></h2>
        
        <div className="instagram_grid">
          {posts.map((post) => (
            <a 
              key={post.id} 
              href={post.permalink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="insta_item_link"
              aria-label={`Ver publicación de Instagram: ${post.caption ? post.caption.substring(0, 20) : 'Imagen'}`}
            >
              <div className="insta_item">
                <img 
                  src={post.media_url || post.thumbnail_url} 
                  alt={post.caption || 'Instagram Post'} 
                  loading="lazy" 
                  width="300"
                  height="300"
                />
              <div className="insta_overlay">
                  <svg viewBox="0 0 24 24" fill="white" width="28" height="28" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="insta_icon">Ver en Instagram</span>
              </div>
              </div>
            </a>
          ))}
        </div>

        <a 
          href="https://www.instagram.com/naamastudio_/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="instagram_profile_link"
        >
          Ver Perfil Oficial
        </a>
      </div>
    </div>
  );
};

export default InstagramFeed;
