import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import '../../styles/MundoCard.css';

const MundoCard = ({ mundo }) => {
  const navigate = useNavigate();
  const Icon = Icons[mundo.icon] || Icons.Sparkles;

  const bgStyle = {
    backgroundImage: `url(/src/assets/${mundo.image})`
  };

  return (
    <div className="mundo_card" onClick={() => navigate(`/mundo/${mundo.id}`)}>
      <div className="mundo_bg" style={bgStyle}></div>
      <div className="mundo_badge">{mundo.categories[0]}</div>
      <div className="mundo_icon_top">
        <Icon size={24} strokeWidth={1} />
      </div>
      <div className="mundo_overlay">
        <h3 className="mundo_title serif">{mundo.name}</h3>
        <p className="mundo_description">{mundo.description}</p>
        <div className="mundo_explore">
          <div className="explore_line"></div>
          <span>Descubrir</span>
        </div>
      </div>
    </div>
  );
};

export default MundoCard;
