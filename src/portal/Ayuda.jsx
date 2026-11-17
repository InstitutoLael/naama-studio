import React, { useEffect, useState } from 'react';
import { AlertTriangle, Camera, Check, HelpCircle, PackagePlus, Pencil, Send } from 'lucide-react';
import { api, post } from './api';

const TIPOS = [
  { id: 'falla', titulo: 'Algo no funciona', bajada: 'Un botón, un error, algo raro', Icono: AlertTriangle },
  { id: 'duda', titulo: 'Tengo una duda', bajada: 'No sé cómo hacer algo', Icono: HelpCircle },
  { id: 'cambio', titulo: 'Quiero cambiar algo', bajada: 'Un precio, un dato, una idea', Icono: Pencil },
  { id: 'falta', titulo: 'Falta algo', bajada: 'Un insumo, un servicio, un precio', Icono: PackagePlus },
];

const PANTALLAS = ['Agenda', 'Clientas', 'Insumos', 'Mi mes', 'Precios', 'Aseo', 'Otra'];

const cuando = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
};

async function achicar(archivo) {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = mal;
      i.src = url;
    });
    const k = Math.min(1, 900 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.72);
  } finally {
    URL.revokeObjectURL(url);
  }
}


const PLANTILLAS = [
  {
    id: 'pendientes',
    nombre: 'Lo que falta anotar',
    titulo: 'Equipo 💛 les pedimos esto, por favor',
    cuerpo: 'Con esto podemos mandarles recordatorios y ofertas a las clientas, y comprar a tiempo lo que falta. Toca cada paso y te lleva directo:',
    pasos: [
      { texto: 'Anota el día que vino cada clienta (Clientas → toca su nombre → «Vino hoy» o elige el día)', url: '/portal/clientas' },
      { texto: 'Sube a Insumos todo lo que hay en el salón, con su foto', url: '/portal/insumos' },
      { texto: 'Si algo se acaba o falta, márcalo («Queda poco» o «Se acabó»)', url: '/portal/insumos' },
      { texto: 'Revisa los precios y avísanos si alguno está mal', url: '/portal/precios' },
      { texto: '¿Dudas o algo no funciona? Escríbenos aquí', url: '/portal/ayuda' },
    ],
  },
  { id: 'libre', nombre: 'Escribir otro', titulo: '', cuerpo: '', pasos: [] },
];

/** Solo administración: mandar un mensaje que sale en el Inicio de cada una y les llega al celu. */
const MandarMensaje = ({ yoId }) => {
  const [equipo, setEquipo] = useState([]);
  const [a, setA] = useState([]);
  const [pl, setPl] = useState(PLANTILLAS[0]);
  const [titulo, setTitulo] = useState(PLANTILLAS[0].titulo);
  const [cuerpo, setCuerpo] = useState(PLANTILLAS[0].cuerpo);
  const [estado, setEstado] = useState('');
  useEffect(() => {
    api('cuentas')
      .then((r) => {
        const otras = r.cuentas.filter((c) => c.activa !== false && !c.demo && c.id !== yoId);
        setEquipo(otras);
        setA(otras.map((c) => c.id));
      })
      .catch(() => {});
  }, [yoId]);
  const elegir = (x) => {
    setPl(x);
    setTitulo(x.titulo);
    setCuerpo(x.cuerpo);
  };
  const enviar = async () => {
    setEstado('Enviando…');
    try {
      const r = await post('mensajes', { a, titulo, cuerpo, pasos: pl.pasos });
      const celu = r.resultado.filter((x) => x.alCelu).map((x) => x.nombre.split(' ')[0]);
      setEstado(`¡Listo! Les sale en el Inicio a ${r.resultado.length}.${celu.length ? ` Al celu le llegó a: ${celu.join(', ')}.` : ''}`);
    } catch (err) {
      setEstado(err.message);
    }
  };
  return (
    <section className="mandar">
      <h2 className="seccion__titulo">Mandar un mensaje al equipo</h2>
      <div className="mandar__chips">
        {PLANTILLAS.map((x) => (
          <button key={x.id} type="button" className={`chip ${pl.id === x.id ? 'is-active' : ''}`} onClick={() => elegir(x)}>
            {x.nombre}
          </button>
        ))}
      </div>
      <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" />
      <textarea className="input" rows={3} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} placeholder="Mensaje" />
      {pl.pasos.length > 0 && (
        <ol className="mensaje__pasos">
          {pl.pasos.map((p) => (
            <li key={p.texto}>
              <span>{p.texto}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="ayuda__paso">¿A quién?</p>
      <div className="mandar__chips">
        {equipo.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${a.includes(c.id) ? 'is-active' : ''}`}
            onClick={() => setA((xs) => (xs.includes(c.id) ? xs.filter((x) => x !== c.id) : [...xs, c.id]))}
          >
            {c.nombre.split(' ')[0]}
          </button>
        ))}
      </div>
      <button type="button" className="btn" disabled={!a.length || !titulo.trim() || estado === 'Enviando…'} onClick={enviar}>
        <Send strokeWidth={1.8} /> Enviar a {a.length === equipo.length ? 'todas' : `${a.length}`}
      </button>
      {estado && <p className="muted" role="status">{estado}</p>}
    </section>
  );
};

/** Pantalla de ayuda: escriben lo que necesitan y a la administración le llega al celu. */
const Ayuda = ({ cuenta }) => {
  const [d, setD] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [texto, setTexto] = useState('');
  const [pantalla, setPantalla] = useState('');
  const [foto, setFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState('');
  const [respuestas, setRespuestas] = useState({});

  const cargar = () => api('ayuda').then(setD).catch((e) => setError(e.message));
  useEffect(() => {
    cargar();
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await post('ayuda', { tipo, texto, pantalla, foto });
      setListo(true);
      setTipo(null);
      setTexto('');
      setPantalla('');
      setFoto(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const responder = async (a, estado) => {
    try {
      await post(`ayuda/${a.id}`, { estado, respuesta: respuestas[a.id] ?? '' });
      setRespuestas((r) => ({ ...r, [a.id]: undefined }));
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const pendientes = d?.lista.filter((a) => a.estado !== 'resuelta').length ?? 0;

  return (
    <div className="panel ayuda">
      <header className="panel__cabeza">
        <span className="eyebrow">Estamos para ayudarte</span>
        <h1 className="panel__titulo">
          ¿Necesitas <em>ayuda?</em>
        </h1>
      </header>

      {d?.admin && <MandarMensaje yoId={cuenta?.id} />}

      {listo && (
        <div className="ayuda__listo" role="status">
          <span className="ayuda__check">
            <Check strokeWidth={2.2} />
          </span>
          <div>
            <strong>¡Mensaje enviado!</strong>
            <p>A Diego y Allison les llegó al celu. Te respondemos aquí mismo.</p>
          </div>
          <button type="button" className="portal__link" onClick={() => setListo(false)}>
            Escribir otro
          </button>
        </div>
      )}

      {!listo && (
        <form className="ayuda__form" onSubmit={enviar}>
          <p className="ayuda__paso">1 · ¿Qué pasó?</p>
          <div className="ayuda__tipos">
            {TIPOS.map(({ id, titulo, bajada, Icono }) => (
              <button key={id} type="button" className={`ayuda__tipo ${tipo === id ? 'is-on' : ''}`} onClick={() => setTipo(id)} aria-pressed={tipo === id}>
                <Icono strokeWidth={1.6} />
                <strong>{titulo}</strong>
                <small>{bajada}</small>
              </button>
            ))}
          </div>

          {tipo && (
            <>
              <p className="ayuda__paso">2 · Cuéntanos</p>
              <textarea
                className="input ayuda__texto"
                rows={4}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={
                  tipo === 'falla'
                    ? 'Ej.: Apreté «Agendar» y salió un error rojo'
                    : tipo === 'falta'
                      ? 'Ej.: Falta el tinte 5 de Igora en Insumos'
                      : tipo === 'cambio'
                        ? 'Ej.: El precio del rebaje completo es $20.000'
                        : 'Ej.: ¿Cómo anoto a una clienta nueva?'
                }
                required
              />
              <p className="ayuda__paso">¿En qué parte? <span>(si sabes)</span></p>
              <div className="ayuda__pantallas">
                {PANTALLAS.map((p) => (
                  <button key={p} type="button" className={`chip ${pantalla === p ? 'is-active' : ''}`} onClick={() => setPantalla(pantalla === p ? '' : p)}>
                    {p}
                  </button>
                ))}
              </div>
              <label className="ayuda__foto">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setFoto(await achicar(f));
                  }}
                />
                {foto ? <img src={foto} alt="Captura adjunta" /> : <Camera strokeWidth={1.6} />}
                <span>{foto ? 'Cambiar la foto' : 'Adjuntar una foto o captura (opcional)'}</span>
              </label>
              {error && <p className="portal-error">{error}</p>}
              <button type="submit" className="btn ayuda__enviar" disabled={enviando || !texto.trim()}>
                <Send strokeWidth={1.8} /> {enviando ? 'Enviando…' : 'Enviar a la administración'}
              </button>
            </>
          )}
        </form>
      )}

      {d && d.lista.length > 0 && (
        <section className="ayuda__historial">
          <h2 className="seccion__titulo">{d.admin ? `Lo que ha escrito el equipo${pendientes ? ` · ${pendientes} por revisar` : ''}` : 'Lo que has escrito'}</h2>
          {d.lista.map((a) => (
            <article key={a.id} className={`ayuda__item is-${a.estado}`}>
              <header>
                <span className={`ayuda__estado ayuda__estado--${a.estado}`}>{a.estado === 'resuelta' ? 'Resuelto' : a.estado === 'vista' ? 'Visto' : 'Nuevo'}</span>
                <span className="ayuda__meta">
                  {d.admin && !a.mia ? `${a.quien.split(' ')[0]} · ` : ''}
                  {d.tipos[a.tipo]}
                  {a.pantalla ? ` · ${a.pantalla}` : ''}
                </span>
              </header>
              <p className="ayuda__msg">{a.texto}</p>
              {a.foto && <img className="ayuda__img" src={a.foto} alt="Captura" />}
              <small className="ayuda__fecha">{cuando(a.creado)}</small>
              {a.respuesta && (
                <p className="ayuda__resp">
                  <strong>{a.respondio}:</strong> {a.respuesta}
                </p>
              )}
              {d.admin && a.estado !== 'resuelta' && (
                <div className="ayuda__admin">
                  <input
                    className="input"
                    placeholder="Responderle…"
                    value={respuestas[a.id] ?? ''}
                    onChange={(e) => setRespuestas((r) => ({ ...r, [a.id]: e.target.value }))}
                  />
                  <div className="ayuda__acciones">
                    <button type="button" className="btn btn--sm btn--ghost" onClick={() => responder(a, 'vista')}>
                      {respuestas[a.id] ? 'Responder' : 'Lo vi'}
                    </button>
                    <button type="button" className="btn btn--sm" onClick={() => responder(a, 'resuelta')}>
                      <Check /> Resuelto
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Ayuda;
