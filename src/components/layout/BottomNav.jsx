import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, CalendarCheck, Map } from 'lucide-react';
import '../../styles/BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom_nav" aria-label="Navegación principal móvil">

      <NavLink
        to="/"
        end
        className={({ isActive }) => `bnav_item ${isActive ? 'active' : ''}`}
        aria-label="Inicio"
      >
        <Home size={20} strokeWidth={1.5} />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="/staff"
        className={({ isActive }) => `bnav_item ${isActive ? 'active' : ''}`}
        aria-label="Precios"
      >
        <LayoutGrid size={20} strokeWidth={1.5} />
        <span>Precios</span>
      </NavLink>

      {/* Botón central destacado — Agendar */}
      <NavLink
        to="/reservar"
        className={({ isActive }) => `bnav_item bnav_center ${isActive ? 'active' : ''}`}
        aria-label="Agendar sesión"
      >
        <div className="bnav_center_bubble">
          <CalendarCheck size={22} strokeWidth={1.5} />
        </div>
        <span>Agendar</span>
      </NavLink>

      {/* Google Maps — llegar al estudio */}
      <a
        href="https://www.google.com/maps/search/Arcadia+1297,+San+Miguel,+Santiago,+Chile"
        target="_blank"
        rel="noopener noreferrer"
        className="bnav_item"
        aria-label="Cómo llegar a Naamá Studio"
      >
        <Map size={20} strokeWidth={1.5} />
        <span>Llegar</span>
      </a>

    </nav>
  );
};

export default BottomNav;