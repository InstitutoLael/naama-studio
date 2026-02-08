import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

const MundoCard = ({ mundo }) => {
  const navigate = useNavigate();
  const Icon = Icons[mundo.icon] || Icons.Sparkles;

  return (
    <div className="mundo-card" onClick={() => navigate(`/mundo/${mundo.id}`)}>
      <div className="mundo-icon-wrapper">
        <Icon className="mundo-icon" size={32} />
      </div>
      <div className="mundo-info">
        <h3 className="serif">{mundo.name}</h3>
        <p>{mundo.description}</p>
        <div className="mundo-categories">
          {mundo.categories.map(cat => (
            <span key={cat} className="cat-pill">{cat}</span>
          ))}
        </div>
      </div>
      <div className="mundo-overlay">
        <span className="serif">Explorar</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mundo-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
          animation: fadeIn 0.8s ease forwards;
        }
        .mundo-card:hover {
          border-color: var(--accent-color);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .mundo-icon-wrapper {
          width: 60px;
          height: 60px;
          background: #111;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-color);
        }
        .mundo-info h3 { font-size: 1.8rem; margin-bottom: 10px; }
        .mundo-info p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 20px; }
        .mundo-categories { display: flex; flex-wrap: wrap; gap: 8px; }
        .cat-pill {
          background: #111;
          color: #666;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 10px;
          border-radius: 4px;
        }
        .mundo-overlay {
          position: absolute;
          inset: 0;
          background: rgba(212, 175, 55, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
        }
        .mundo-overlay span { color: #000; font-size: 1.5rem; font-weight: 800; font-style: italic; }
        .mundo-card:hover .mundo-overlay { opacity: 1; }
      `}} />
    </div>
  );
};

export default MundoCard;
