import { useState, useEffect } from 'react';
import SalonArch from '../assets/salon-arch.png';
import LaborHands from '../assets/labor-hands.png';
import MiradaBg from '../assets/mirada-bg.png';
import HeroBg from '../assets/hero-bg.png';

const FALLBACK_POSTS = [
  { id: 'fb1', media_url: SalonArch, caption: 'El silencio como cosmético. #NaamaStudio #SanMiguel', permalink: 'https://www.instagram.com/naamastudio_/' },
  { id: 'fb2', media_url: LaborHands, caption: 'Manos que construyen descanso. #DeepRest #Wellness', permalink: 'https://www.instagram.com/naamastudio_/' },
  { id: 'fb3', media_url: MiradaBg, caption: 'Detalle terapéutico en cada mirada. #Lashes #Brows', permalink: 'https://www.instagram.com/naamastudio_/' },
  { id: 'fb4', media_url: HeroBg, caption: 'Hospitalidad técnica de alto nivel. #Santiago #Belleza', permalink: 'https://www.instagram.com/naamastudio_/' }
];

export const useInstagramFeed = (token) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
        if (!token) {
            console.log('No Instagram token provided, using fallback content.');
            setPosts(FALLBACK_POSTS);
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching Instagram feed...');
            const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${token}&limit=4`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Instagram API Error: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Filter only IMAGE or CAROUSEL_ALBUM media types for simplicity, or handle VIDEO
            const activePosts = data.data.slice(0, 4); // limit to 4 to match grid

            setPosts(activePosts);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch Instagram feed:', err);
            setError(err);
            setPosts(FALLBACK_POSTS); // Fallback on error
            setLoading(false);
        }
    };

    fetchInstagramPosts();
  }, [token]);

  return { posts, loading, error };
};
