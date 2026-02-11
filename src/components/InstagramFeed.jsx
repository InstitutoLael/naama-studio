import React from 'react';
import { useInstagramFeed } from '../hooks/useInstagramFeed';
import '../styles/InstagramFeed.css';

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
                  <span className="insta_icon">Use App</span>
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
