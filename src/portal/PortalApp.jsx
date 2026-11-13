import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Ellipsis, House, KeyRound, LogOut, Package, ShoppingBag, Smartphone, UsersRound, Wallet } from 'lucide-react';
import Logo from '../components/common/Logo';
import { api, post } from './api';
import { Configurar, CrearClave, Entrar } from './Acceso';
import Panel from './Panel';
import Cuentas from './Cuentas';
import Clientas from './Clientas';
import Insumos from './Insumos';
import Compras from './Compras';
import Plata from './Plata';
import Instalar, { esApp, registrarAppPortal } from './Instalar';
import Hoja from './Hoja';
import { MODULOS, ROLES, puede } from './permisos';
import { ICONO_MODULO } from './iconos';
import '../theme/booking.css';
import '../theme/portal.css';

const usePortalHead = () => {
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]');
    const previo = { titulo: document.title, manifest: link?.getAttribute('href') };
    document.title = 'Naamá · Portal del equipo';
    const robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex, nofollow' });
    document.head.appendChild(robots);
    link?.setAttribute('href', '/portal-manifest.webmanifest');
    document.documentElement.classList.add('en-portal');
    registrarAppPortal();
    return () => {
      robots.remove();
      document.title = previo.titulo;
      if (previo.manifest) link?.setAttribute('href', previo.manifest);
      document.documentElement.classList.remove('en-portal');
    };
  }, []);
};

/** Pestañas del menú: hasta 3 accesos + «Más». */
const pestanas = (cuenta) => [
  { to: '/portal', label: 'Inicio', Icono: House, end: true },
  { to: '/portal/clientas', label: 'Clientas', Icono: UsersRound },
  { to: '/portal/insumos', label: 'Insumos', Icono: Package },
  { to: '/portal/compras', label: 'Compras', Icono: ShoppingBag },
  // Plata y Equipo van en la barra lateral del computador; en el celular están en «Más» y en Inicio.
  ...(puede(cuenta, 'finanzas') ? [{ to: '/portal/plata', label: 'Plata', Icono: Wallet, soloCompu: true }] : []),
  ...(puede(cuenta, 'cuentas') ? [{ to: '/portal/cuentas', label: 'Equipo', Icono: KeyRound, soloCompu: true }] : []),
];

const Menu = ({ cuenta, onMas }) => (
  <nav className="tabbar" aria-label="Menú del portal">
    <Link to="/portal" className="tabbar__logo" aria-label="Inicio">
      <Logo />
    </Link>
    {pestanas(cuenta).map(({ to, label, Icono, end, soloCompu }) => (
      <NavLink key={to} to={to} end={end} className={`tabbar__item ${soloCompu ? 'tabbar__item--compu' : ''}`}>
        <Icono strokeWidth={1.6} />
        <span>{label}</span>
      </NavLink>
    ))}
    <button type="button" className="tabbar__item" onClick={onMas}>
      <Ellipsis strokeWidth={1.6} />
      <span>Más</span>
    </button>
    <div className="tabbar__yo">
      <span className="avatar avatar--sm">{cuenta.nombre.charAt(0)}</span>
      <span>
        <strong>{cuenta.nombre}</strong>
        <small>{ROLES[cuenta.rol]?.nombre}</small>
      </span>
    </div>
  </nav>
);

const HojaMas = ({ cuenta, onCerrar, onClave, onSalir }) => {
  const pronto = MODULOS.filter((m) => !m.listo && (!m.permiso || puede(cuenta, m.permiso)));
  return (
    <Hoja titulo="Más" onCerrar={onCerrar}>
      <div className="mas__yo">
        <span className="avatar">{cuenta.nombre.charAt(0)}</span>
        <span>
          <strong>{cuenta.nombre}</strong>
          <small>
            {ROLES[cuenta.rol]?.nombre} · {cuenta.email}
          </small>
        </span>
      </div>
      <ul className="grupo-lista">
        {puede(cuenta, 'finanzas') && (
          <li>
            <Link to="/portal/plata" className="fila-lista" onClick={onCerrar}>
              <Wallet strokeWidth={1.6} /> La plata
            </Link>
          </li>
        )}
        {puede(cuenta, 'cuentas') && (
          <li>
            <Link to="/portal/cuentas" className="fila-lista" onClick={onCerrar}>
              <KeyRound strokeWidth={1.6} /> Equipo y cuentas
            </Link>
          </li>
        )}
        {!esApp() && (
          <li>
            <Link to="/portal/app" className="fila-lista" onClick={onCerrar}>
              <Smartphone strokeWidth={1.6} /> Instalar la app en el celular
            </Link>
          </li>
        )}
        <li>
          <button type="button" className="fila-lista" onClick={onClave}>
            <KeyRound strokeWidth={1.6} /> Cambiar mi clave
          </button>
        </li>
        <li>
          <button type="button" className="fila-lista fila-lista--peligro" onClick={onSalir}>
            <LogOut strokeWidth={1.6} /> Cerrar sesión
          </button>
        </li>
      </ul>
      {pronto.length > 0 && (
        <>
          <p className="grupo__titulo">Muy pronto</p>
          <ul className="pronto">
            {pronto.map((m) => {
              const Icono = ICONO_MODULO[m.id];
              return (
                <li key={m.id}>
                  {Icono && <Icono strokeWidth={1.6} />} {m.nombre}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Hoja>
  );
};

/** Zona privada del equipo: /portal. Diseño de app propio; no usa el menú de la web. */
const PortalApp = () => {
  usePortalHead();
  const location = useLocation();
  const navigate = useNavigate();
  const [estado, setEstado] = useState({ cargando: true });
  const [cambiandoClave, setCambiandoClave] = useState(false);
  const [mas, setMas] = useState(false);

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
  }, [cargar]);

  useEffect(() => {
    setCambiandoClave(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const salir = async () => {
    if (!window.confirm('¿Cerrar sesión?')) return;
    setMas(false);
    try {
      await post('salir');
    } catch {
      // aunque falle, mostramos la pantalla de entrada
    }
    setEstado((e) => ({ ...e, cuenta: null }));
    navigate('/portal', { replace: true });
  };

  // La página para instalar la app se ve con o sin sesión.
  if (location.pathname.replace(/\/$/, '') === '/portal/app') {
    return (
      <div className="portal portal--acceso">
        <Instalar />
      </div>
    );
  }

  const { cuenta } = estado;

  if (estado.cargando) {
    return (
      <div className="portal portal--acceso">
        <div className="splash">
          <Logo />
        </div>
      </div>
    );
  }

  if (estado.error || !estado.configurado || !cuenta || cuenta.debeCambiar) {
    let pantalla;
    if (estado.error)
      pantalla = (
        <section className="acceso">
          <div className="acceso__marca">
            <Logo />
          </div>
          <div className="acceso__caja">
            <p className="portal-error" role="alert">{estado.error}</p>
            <button type="button" className="btn" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </section>
      );
    else if (!estado.configurado) pantalla = <Configurar onListo={(c) => setEstado({ configurado: true, cuenta: c })} />;
    else if (!cuenta) pantalla = <Entrar onListo={(c) => setEstado({ configurado: true, cuenta: c })} />;
    else
      pantalla = (
        <CrearClave
          cuenta={cuenta}
          obligatoria
          onListo={() => setEstado((e) => ({ ...e, cuenta: { ...e.cuenta, debeCambiar: false } }))}
          onSalir={salir}
        />
      );
    return <div className="portal portal--acceso">{pantalla}</div>;
  }

  return (
    <div className="portal portal--app">
      <Menu cuenta={cuenta} onMas={() => setMas(true)} />
      <main id="contenido" className="portal__cuerpo">
        {cambiandoClave ? (
          <CrearClave cuenta={cuenta} obligatoria={false} onListo={() => setCambiandoClave(false)} onSalir={() => setCambiandoClave(false)} />
        ) : (
          <Routes>
            <Route index element={<Panel cuenta={cuenta} />} />
            <Route path="clientas" element={<Clientas />} />
            <Route path="insumos" element={<Insumos cuenta={cuenta} />} />
            <Route path="compras" element={<Compras />} />
            <Route path="plata" element={puede(cuenta, 'finanzas') ? <Plata /> : <Navigate to="/portal" replace />} />
            <Route path="cuentas" element={puede(cuenta, 'cuentas') ? <Cuentas yo={cuenta} /> : <Navigate to="/portal" replace />} />
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Routes>
        )}
      </main>
      {mas && (
        <HojaMas
          cuenta={cuenta}
          onCerrar={() => setMas(false)}
          onClave={() => {
            setMas(false);
            setCambiandoClave(true);
          }}
          onSalir={salir}
        />
      )}
    </div>
  );
};

export default PortalApp;
