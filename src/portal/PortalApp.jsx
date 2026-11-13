import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { api, post } from './api';
import { Configurar, CrearClave, Entrar } from './Acceso';
import Panel from './Panel';
import Cuentas from './Cuentas';
import { puede } from './permisos';
import '../theme/booking.css';
import '../theme/portal.css';

/** Zona privada del equipo: /portal. Tiene su propia cabecera; no usa el menú de la web. */
const PortalApp = () => {
  const [estado, setEstado] = useState({ cargando: true });
  const [cambiandoClave, setCambiandoClave] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const r = await api('estado');
      setEstado({ configurado: r.configurado, cuenta: r.cuenta });
    } catch (err) {
      setEstado({ error: err.message });
    }
  }, []);

  useEffect(() => {
    cargar();
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    const tituloPrevio = document.title;
    document.title = 'Portal del equipo · Naamá Studio';
    return () => {
      robots.remove();
      document.title = tituloPrevio;
    };
  }, [cargar]);

  const salir = async () => {
    if (!window.confirm('¿Cerrar sesión?')) return;
    try {
      await post('salir');
    } catch {
      // aunque falle, mostramos la pantalla de entrada
    }
    setEstado((e) => ({ ...e, cuenta: null }));
  };

  const { cuenta } = estado;

  let contenido;
  if (estado.cargando) contenido = <p className="portal-cargando muted">Cargando…</p>;
  else if (estado.error)
    contenido = (
      <section className="acceso">
        <div className="acceso__caja">
          <p className="portal-error" role="alert">{estado.error}</p>
          <button type="button" className="btn" onClick={cargar}>
            Reintentar
          </button>
        </div>
      </section>
    );
  else if (!estado.configurado) contenido = <Configurar onListo={(c) => setEstado({ configurado: true, cuenta: c })} />;
  else if (!cuenta) contenido = <Entrar onListo={(c) => setEstado({ configurado: true, cuenta: c })} />;
  else if (cuenta.debeCambiar || cambiandoClave)
    contenido = (
      <CrearClave
        cuenta={cuenta}
        obligatoria={cuenta.debeCambiar}
        onListo={() => {
          setCambiandoClave(false);
          setEstado((e) => ({ ...e, cuenta: { ...e.cuenta, debeCambiar: false } }));
        }}
        onSalir={cuenta.debeCambiar ? salir : () => setCambiandoClave(false)}
      />
    );
  else
    contenido = (
      <Routes>
        <Route index element={<Panel cuenta={cuenta} />} />
        <Route path="cuentas" element={puede(cuenta, 'cuentas') ? <Cuentas yo={cuenta} /> : <Navigate to="/portal" replace />} />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    );

  return (
    <div className="portal">
      <header className="portal__barra">
        <Link to="/portal" className="portal__logo" aria-label="Portal Naamá, inicio">
          <Logo />
          <span>Portal</span>
        </Link>
        {cuenta && !cuenta.debeCambiar && (
          <nav className="portal__acciones" aria-label="Tu cuenta">
            <button type="button" className="portal__link" onClick={() => setCambiandoClave(true)}>
              Mi clave
            </button>
            <button type="button" className="portal__link" onClick={salir}>
              Cerrar sesión
            </button>
          </nav>
        )}
      </header>
      <main id="contenido" className="portal__cuerpo">
        {contenido}
      </main>
    </div>
  );
};

export default PortalApp;
