import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckIcon } from '../components/common/Icons';
import Logo from '../components/common/Logo';

/* ── Instalación como app ─────────────────────────────────
   Android/Chrome avisa con «beforeinstallprompt»: lo guardamos apenas carga el portal.
   iPhone no tiene botón: hay que explicar «Compartir → Agregar a inicio». */

let avisoInstalar = null;
const oyentes = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    avisoInstalar = e;
    oyentes.forEach((fn) => fn(e));
  });
  window.addEventListener('appinstalled', () => {
    avisoInstalar = null;
    oyentes.forEach((fn) => fn(null));
  });
}

export const registrarAppPortal = () => {
  if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
    navigator.serviceWorker.register('/portal-sw.js', { scope: '/portal' }).catch(() => {});
  }
};

export const esApp = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);

const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent);
const esIphone = () => /iPhone|iPad|iPod/i.test(ua()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// Navegadores dentro de otras apps (WhatsApp, Instagram, Facebook) no dejan instalar.
const enOtraApp = () => /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)/i.test(ua());

const IconoCompartir = () => (
  <svg viewBox="0 0 24 24" className="icono-paso" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
    <path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H16" />
  </svg>
);
const IconoMas = () => (
  <svg viewBox="0 0 24 24" className="icono-paso" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
);
const IconoMenu = () => (
  <svg viewBox="0 0 24 24" className="icono-paso" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </svg>
);

const Paso = ({ n, icono, children }) => (
  <li className="paso">
    <span className="paso__n">{n}</span>
    <span className="paso__texto">{children}</span>
    {icono}
  </li>
);

const PasosIphone = () => (
  <ol className="pasos">
    <Paso n="1" icono={<IconoCompartir />}>
      Abajo en Safari, toca el botón <strong>Compartir</strong>.
    </Paso>
    <Paso n="2" icono={<IconoMas />}>
      Baja y toca <strong>«Agregar a inicio»</strong>.
    </Paso>
    <Paso n="3">
      Arriba a la derecha, toca <strong>«Agregar»</strong>. Listo: aparece el ícono de Naamá en tu pantalla.
    </Paso>
  </ol>
);

const PasosAndroid = () => (
  <ol className="pasos">
    <Paso n="1" icono={<IconoMenu />}>
      Arriba a la derecha en Chrome, toca los <strong>tres puntitos</strong>.
    </Paso>
    <Paso n="2">
      Toca <strong>«Instalar app»</strong> o <strong>«Agregar a la pantalla principal»</strong>.
    </Paso>
    <Paso n="3">
      Toca <strong>«Instalar»</strong>. Listo: aparece el ícono de Naamá con tus apps.
    </Paso>
  </ol>
);

const Instalar = () => {
  const [aviso, setAviso] = useState(avisoInstalar);
  const [instalada, setInstalada] = useState(esApp());
  const [ver, setVer] = useState(esIphone() ? 'iphone' : 'android');

  useEffect(() => {
    const fn = (e) => {
      setAviso(e);
      if (!e) setInstalada(true);
    };
    oyentes.add(fn);
    return () => oyentes.delete(fn);
  }, []);

  const otraApp = enOtraApp();
  const link = `${window.location.origin}/portal/app`;

  return (
    <section className="acceso">
      <div className="acceso__marca">
        <Logo />
        <span>Portal del equipo</span>
      </div>
      <div className="acceso__caja instalar">
        <span className="eyebrow">App del equipo</span>
        <h1 className="acceso__titulo">
          Naamá en tu <em>celular.</em>
        </h1>

        {instalada ? (
          <>
            <p className="instalar__lista">
              <CheckIcon /> Ya estás usando la app.
            </p>
            <Link to="/portal" className="btn">
              Ir al portal <ArrowRight />
            </Link>
          </>
        ) : otraApp ? (
          <div className="acceso__nota">
            <p>
              <strong>Abriste el link dentro de WhatsApp o Instagram.</strong> Desde ahí no se puede instalar.
            </p>
            <p>
              Toca los <strong>tres puntitos</strong> (o el ícono de arriba a la derecha) y elige{' '}
              <strong>{esIphone() ? '«Abrir en Safari»' : '«Abrir en Chrome»'}</strong>.
            </p>
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => navigator.clipboard?.writeText(link)}>
              Copiar el link
            </button>
          </div>
        ) : (
          <>
            <p className="acceso__bajada muted">Se instala en un minuto, sin App Store ni Play Store, y abre directo al portal.</p>

            {aviso && (
              <button
                type="button"
                className="btn instalar__boton"
                onClick={async () => {
                  aviso.prompt();
                  const r = await aviso.userChoice;
                  if (r.outcome === 'accepted') setInstalada(true);
                  setAviso(null);
                  avisoInstalar = null;
                }}
              >
                Instalar app
              </button>
            )}

            <div className="herramientas__chips" role="tablist">
              <button type="button" role="tab" className="chip" aria-pressed={ver === 'iphone'} onClick={() => setVer('iphone')}>
                iPhone
              </button>
              <button type="button" role="tab" className="chip" aria-pressed={ver === 'android'} onClick={() => setVer('android')}>
                Android
              </button>
            </div>
            {ver === 'iphone' ? <PasosIphone /> : <PasosAndroid />}
            {ver === 'iphone' && !esIphone() && <p className="muted instalar__nota">En iPhone hay que hacerlo desde Safari.</p>}
            {ver === 'android' && aviso && <p className="muted instalar__nota">O más fácil: toca el botón «Instalar app» de arriba.</p>}
          </>
        )}
        <Link to="/portal" className="acceso__olvido">
          Volver al portal
        </Link>
      </div>
    </section>
  );
};

export default Instalar;
