import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Calendar, User } from 'lucide-react';
import '../../styles/BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom_nav">
      <NavLink to="/" className={({ isActive }) => `bottom_nav_item ${isActive ? 'active' : ''}`}>
        <Home size={20} strokeWidth={1.5} />
        <span>Inicio</span>
      </NavLink>
      <NavLink to="/mundos" className={({ isActive }) => `bottom_nav_item ${isActive ? 'active' : ''}`}>
        <Grid size={20} strokeWidth={1.5} />
        <span>Servicios</span>
      </NavLink>
      <NavLink to="/reservar" className={({ isActive }) => `bottom_nav_item ${isActive ? 'active' : ''}`}>
        <Calendar size={20} strokeWidth={1.5} />
        <span>Mi Cita</span>
      </NavLink>
      <NavLink to="/staff" className={({ isActive }) => `bottom_nav_item ${isActive ? 'active' : ''}`}>
        <User size={20} strokeWidth={1.5} />
        <span>Precios</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
