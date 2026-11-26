import React, { useEffect, useState } from 'react';
import { api } from './api';

const NOMBRE_ORIGEN = {
  google: 'Google (búsqueda)',
  'google-maps': 'Google Maps',
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
  impresos: 'Flyer, afiche o tarjeta (QR)',
  directo: 'Escribieron la dirección',
  otro: 'Otros sitios',
};
const NOMBRE_PAGINA = (r) =>
  ({ '/': 'Inicio', '/servicios': 'Servicios', '/reservar': 'Reservar', '/equipo': 'Equipo', '/galeria': 'Galería', '/gift-cards': 'Gift cards', '/empresas': 'Empresas', '/contacto': 'Contacto', '/preguntas': 'Preguntas' })[r] ??
  (r.startsWith('/servicios/') ? `Servicios · ${r.split('/')[2]}` : r);

/** Visitas a la web: cuánta gente entra, de dónde llega y cuántas terminan escribiendo o reservando. */
const Visitas = () => {
  const [dias, setDias] = useState(30);
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    setD(null);
    api(`visitas?dias=${dias}`)
      .then(setD)
      .catch((e) => setError(e.message));
  }, [dias]);

  const max = d ? Math.max(1, ...d.serie.map((x) => x.visitas)) : 1;
  const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : '—');

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Solo Administración</span>
        <h1 className="panel__titulo">
          Visitas a la <em>web</em>
        </h1>
      </header>
      <div className="chips" role="group" aria-label="Periodo">
        {[7, 30, 90].map((n) => (
          <button key={n} type="button" className={`chip ${dias === n ? 'is-active' : ''}`} onClick={() => setDias(n)}>
            Últimos {n} días
          </button>
        ))}
      </div>
      {error && <p className="portal-error">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}
      {d && (
        <>
          <dl className="cifras">
            <div>
              <dt>Visitas</dt>
              <dd>{d.visitas.toLocaleString('es-CL')}</dd>
            </div>
            <div>
              <dt>Tocaron WhatsApp</dt>
              <dd>{d.whatsapp.toLocaleString('es-CL')}</dd>
            </div>
            <div>
              <dt>Reservas web</dt>
              <dd>{d.reservas.toLocaleString('es-CL')}</dd>
            </div>
          </dl>
          <p className="muted chico">
            {d.visitas > 0 ? `De cada 100 visitas, ${pct(d.whatsapp, d.visitas).replace('%', '')} escriben por WhatsApp. ` : 'Las visitas se empiezan a contar desde hoy. '}
            Las reservas web son las horas que quedaron pedidas en la agenda.
          </p>

          <section className="visitas-grafico tarjeta" aria-label="Visitas por día">
            <div className="visitas-barras">
              {d.serie.map((x) => (
                <span key={x.dia} title={`${x.dia}: ${x.visitas}`} style={{ height: `${x.visitas ? 8 + (92 * x.visitas) / max : 3}%` }} />
              ))}
            </div>
            <div className="caja-barras__eje">
              <span>{new Date(`${d.serie[0].dia}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</span>
              <span>hoy</span>
            </div>
          </section>

          <section>
            <h2 className="seccion__titulo">De dónde llegan</h2>
            {d.origenes.length === 0 ? (
              <p className="nota-mano">todavía no hay datos</p>
            ) : (
              <ul className="cuentas">
                {d.origenes.map((o) => (
                  <li key={o.clave} className="fila-dato">
                    <span>{NOMBRE_ORIGEN[o.clave] ?? o.clave}</span>
                    <strong>{o.n}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="seccion__titulo">Páginas más vistas</h2>
            <ul className="cuentas">
              {d.paginas.map((p) => (
                <li key={p.clave} className="fila-dato">
                  <span>{NOMBRE_PAGINA(p.clave)}</span>
                  <strong>{p.n}</strong>
                </li>
              ))}
            </ul>
          </section>
          <p className="muted chico">Se cuenta sin cookies ni datos de nadie. No se cuentan los celulares y computadores donde alguien del equipo entró al portal.</p>
        </>
      )}
    </div>
  );
};

export default Visitas;
