import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Scissors, Calendar, Image, MapPin } from 'lucide-react';
import '../../styles/BottomNav.css';

const navItems = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/staff", label: "Servicios", icon: Scissors },
  { path: "/reservar", label: "Agendar", icon: Calendar, highlight: true },
  // { path: "/galeria", label: "Galería", icon: Image },
  { path: "/contacto", label: "Contacto", icon: MapPin },
];

const BottomNav = () => {
  return (
    <nav className="bottom_nav" aria-label="Navegación principal móvil">
      {navItems.map((item) => {
        const Icon = item.icon;
        
        if (item.highlight) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `bnav_item bnav_center ${isActive ? 'active' : ''}`}
              aria-label={item.label}
            >
              <div className="bnav_center_bubble">
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `bnav_item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;