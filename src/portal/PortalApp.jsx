import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CalendarClock, Ellipsis, House, KeyRound, LogOut, Package, Plus, Smartphone, UsersRound } from 'lucide-react';
import Logo from '../components/common/Logo';
import { api, post } from './api';
import { Configurar, CrearClave, Entrar } from './Acceso';
import Panel from './Panel';
import Cuentas from './Cuentas';
import Clientas from './Clientas';
import Insumos from './Insumos';
import Compras from './Compras';
import Plata from './Plata';
import Servicios from './Servicios';
import Caja from './Caja';
import Disponibilidad from './Disponibilidad';
import MiMes from './MiMes';
import TeToca from './TeToca';
import Agenda from './Agenda';
import Aseo from './Aseo';
import Resenas from './Resenas';
import Precios from './Precios';
import Ayuda from './Ayuda';
import GiftCards from './GiftCards';
import Instalar, { esApp, registrarAppPortal } from './Instalar';
import Hoja from './Hoja';
import { ROLES, modulosPorGrupo, nombreModulo, puede } from './permisos';
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
    const apple = document.querySelector('link[rel="apple-touch-icon"]');
    const appleAntes = apple?.getAttribute('href');
    apple?.setAttribute('href', '/app-naama-apple.png');
    document.documentElement.classList.add('en-portal');
    registrarAppPortal();
    return () => {
      robots.remove();
      document.title = previo.titulo;
      if (previo.manifest) link?.setAttribute('href', previo.manifest);
      if (appleAntes) apple?.setAttribute('href', appleAntes);
      document.documentElement.classList.remove('en-portal');
    };
  }, []);
};

// Barra inferior (celular): siempre con nombre. El + del centro anota lo principal de cada una.
const PRINCIPALES = [
  { to: '/portal', label: 'Inicio', Icono: House, end: true },
  { to: '/portal/agenda', label: 'Agenda', Icono: CalendarClock },
  { to: '/portal/clientas', label: 'Clientas', Icono: UsersRound },
  { to: '/portal/insumos', label: 'Insumos', Icono: Package },
];

const Menu = ({ cuenta, onMas }) => {
  const mas = puede(cuenta, 'servicios') ? { to: '/portal/servicios', label: 'Anotar servicio' } : { to: '/portal/mi-mes', label: 'Anotar lo que hice' };
  const item = ({ to, label, Icono, end }) => (
    <NavLink key={to} to={to} end={end} className="tabbar__item">
      <Icono strokeWidth={1.6} />
      <span>{label}</span>
    </NavLink>
  );
  return (
    <>
      <nav className="tabbar" aria-label="Menú del portal">
        {PRINCIPALES.slice(0, 2).map(item)}
        <span className="tabbar__hueco" aria-hidden="true" />
        {PRINCIPALES.slice(2).map(item)}
        <button type="button" className="tabbar__item" onClick={onMas}>
          <Ellipsis strokeWidth={1.6} />
          <span>Más</span>
        </button>
      </nav>
      <Link to={mas.to} className="tabbar__mas" aria-label={mas.label}>
        <Plus strokeWidth={2} />
      </Link>

      {/* Computador: barra lateral oscura con los mismos grupos */}
      <nav className="lateral" aria-label="Menú del portal">
        <Link to="/portal" className="lateral__logo" aria-label="Inicio">
          <Logo />
        </Link>
        <NavLink to="/portal" end className="lateral__item">
          <House strokeWidth={1.6} /> Inicio
        </NavLink>
        {modulosPorGrupo(cuenta).map((g) => (
          <div key={g.id} className="lateral__grupo">
            <p>{g.nombre}</p>
            {g.modulos.map((m) => {
              const Icono = ICONO_MODULO[m.id];
              return (
                <NavLink key={m.id} to={`/portal/${m.id}`} className="lateral__item">
                  {Icono && <Icono strokeWidth={1.6} />} {m.corto && m.id !== 'cuentas' ? m.nombre : nombreModulo(m)}
                </NavLink>
              );
            })}
          </div>
        ))}
        <button type="button" className="lateral__yo" onClick={onMas}>
          <span className="avatar avatar--sm">{cuenta.nombre.charAt(0)}</span>
          <span>
            <strong>{cuenta.nombre}</strong>
            <small>{ROLES[cuenta.rol]?.nombre}</small>
          </span>
        </button>
      </nav>
    </>
  );
};

const COLORES = ['terracota', 'cafe', 'arcilla', 'tinta'];

const HojaMas = ({ cuenta, onCerrar, onClave, onSalir }) => {
  let n = -1;
  return (
    <Hoja titulo="Todo el portal" onCerrar={onCerrar}>
      <div className="mas__yo">
        <span className="avatar">{cuenta.nombre.charAt(0)}</span>
        <span>
          <strong>{cuenta.nombre}</strong>
          <small>
            {ROLES[cuenta.rol]?.nombre} · {cuenta.email}
          </small>
        </span>
      </div>
      {modulosPorGrupo(cuenta).map((g) => (
        <div key={g.id} className="mas__grupo">
          <p className="grupo__titulo">{g.nombre}</p>
          <ul className="mas__cuadros">
            {g.modulos.map((m) => {
              const Icono = ICONO_MODULO[m.id];
              n += 1;
              return (
                <li key={m.id}>
                  <Link to={`/portal/${m.id}`} className={`cuadro cuadro--${COLORES[n % COLORES.length]}`} onClick={onCerrar}>
                    {Icono && <Icono strokeWidth={1.6} />}
                    <span>{m.corto ?? nombreModulo(m)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p className="grupo__titulo">Mi cuenta</p>
      <ul className="grupo-lista">
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
            <Route path="clientas" element={<Clientas cuenta={cuenta} />} />
            <Route path="insumos" element={<Insumos cuenta={cuenta} />} />
            <Route path="compras" element={<Compras />} />
            <Route
              path="servicios"
              element={puede(cuenta, 'servicios') || puede(cuenta, 'verServicios') ? <Servicios cuenta={cuenta} /> : <Navigate to="/portal" replace />}
            />
            <Route path="te-toca" element={puede(cuenta, 'clientas') ? <TeToca /> : <Navigate to="/portal" replace />} />
            <Route path="aseo" element={<Aseo />} />
            <Route path="agenda" element={<Agenda cuenta={cuenta} />} />
            <Route path="resenas" element={<Resenas cuenta={cuenta} />} />
            <Route path="precios" element={<Precios cuenta={cuenta} />} />
            <Route path="ayuda" element={<Ayuda cuenta={cuenta} />} />
            <Route path="giftcards" element={puede(cuenta, 'servicios') || puede(cuenta, 'finanzas') ? <GiftCards /> : <Navigate to="/portal" replace />} />
            <Route path="caja" element={puede(cuenta, 'caja') ? <Caja /> : <Navigate to="/portal" replace />} />
            <Route path="disponibilidad" element={<Disponibilidad />} />
            <Route path="mi-mes" element={<MiMes cuenta={cuenta} />} />
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
