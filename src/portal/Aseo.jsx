import React, { useCallback, useEffect, useState } from 'react';
import { Check, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, post } from './api';
import Hoja from './Hoja';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const diasTexto = (ds) => (ds.length === 6 && !ds.includes(0) ? 'Lun a sáb' : ds.length === 7 ? 'Todos los días' : ds.map((d) => DIAS[d]).join(', '));

const FormTarea = ({ tarea, equipo, onListo, onCerrar }) => {
  const [dias, setDias] = useState(tarea?.dias ?? [1, 2, 3, 4, 5, 6]);
  const [error, setError] = useState('');
  return (
    <Hoja titulo={tarea ? 'Editar tarea' : 'Nueva tarea'} onCerrar={onCerrar}>
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await post(tarea ? `tareas/${tarea.id}` : 'tareas', { texto: f.get('texto'), cuentaId: f.get('quien') || null, dias });
            onListo();
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <div className="field">
          <label htmlFor="ta-t">¿Qué hay que hacer?</label>
          <input id="ta-t" name="texto" className="input" defaultValue={tarea?.texto ?? ''} placeholder="Ej.: Esterilizar alicates y limas" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="ta-q">¿A quién le toca?</label>
          <select id="ta-q" name="quien" className="input" defaultValue={tarea ? (tarea.cuentaId ?? '') : '-1'}>
            <option value="-1">Por turnos (se reparte entre las que vienen ese día)</option>
            <option value="">A cualquiera</option>
            {equipo.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="field__titulo">¿Qué días?</span>
          <div className="chips chips--chicos">
            {DIAS.map((d, i) => (
              <button
                key={d}
                type="button"
                aria-pressed={dias.includes(i)}
                className={`chip ${dias.includes(i) ? 'is-active' : ''}`}
                onClick={() => setDias((xs) => (xs.includes(i) ? xs.filter((x) => x !== i) : [...xs, i]))}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="portal-error">{error}</p>}
        <div className="hoja__acciones">
          <button type="submit" className="btn">
            Guardar
          </button>
          {tarea && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={async () => {
                if (!window.confirm('¿Quitar esta tarea?')) return;
                await post(`tareas/${tarea.id}`, { borrar: true });
                onListo();
              }}
            >
              <Trash2 size={16} /> Quitar
            </button>
          )}
        </div>
      </form>
    </Hoja>
  );
};

const Aseo = () => {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [hoja, setHoja] = useState(null);

  const cargar = useCallback(() => {
    api('tareas')
      .then(setD)
      .catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const marcar = async (t) => {
    try {
      await post(`tareas/${t.id}/hecha`, { hecha: !t.hecha });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const Fila = ({ t }) => (
    <li className={`compromiso ${t.hecha ? 'is-pagado' : ''}`}>
      <button type="button" className="compromiso__check" aria-pressed={Boolean(t.hecha)} aria-label={t.hecha ? `Desmarcar ${t.texto}` : `Marcar ${t.texto} como hecha`} onClick={() => marcar(t)}>
        {t.hecha && <Check size={16} strokeWidth={2.4} />}
      </button>
      <span className="compromiso__texto">
        <strong>{t.texto}</strong>
        <small>{t.hecha ? `Hecha por ${t.hecha.por}` : t.quien}</small>
      </span>
    </li>
  );

  const otras = d ? d.todas.filter((t) => !d.mias.some((m) => m.id === t.id)) : [];

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Hoy</span>
        <h1 className="panel__titulo">
          Aseo y <em>tareas</em>
        </h1>
      </header>
      {error && <p className="portal-error" role="alert">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}
      {d && (
        <>
          <section>
            <h2 className="seccion__titulo">
              Te toca hoy ({d.mias.filter((t) => t.hecha).length}/{d.mias.length})
            </h2>
            {d.mias.length === 0 ? (
              <div className="vacio">
                <ListChecks strokeWidth={1.2} />
                <p>
                  <strong>Nada para hoy.</strong>
                </p>
              </div>
            ) : (
              <ul className="cuentas">
                {d.mias.map((t) => (
                  <Fila key={t.id} t={t} />
                ))}
              </ul>
            )}
          </section>
          {otras.length > 0 && (
            <section>
              <h2 className="seccion__titulo">Lo de las demás</h2>
              <ul className="cuentas">
                {otras.map((t) => (
                  <Fila key={t.id} t={t} />
                ))}
              </ul>
            </section>
          )}
          {d.puedeAdministrar && (
            <section>
              <h2 className="seccion__titulo">Todas las tareas</h2>
              <ul className="cuentas">
                {d.lista.map((t) => (
                  <li key={t.id} className="pedido">
                    <span className="pedido__texto">
                      <strong>{t.texto}</strong>
                      <small>
                        {t.quien} · {diasTexto(t.dias)}
                      </small>
                    </span>
                    <button type="button" className="icono-boton" aria-label={`Editar ${t.texto}`} onClick={() => setHoja({ tarea: t })}>
                      <Pencil size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="portal__link" onClick={() => setHoja({})}>
                <Plus size={14} /> Agregar tarea
              </button>
            </section>
          )}
        </>
      )}
      {hoja && (
        <FormTarea
          tarea={hoja.tarea}
          equipo={d.equipo}
          onListo={() => {
            setHoja(null);
            cargar();
          }}
          onCerrar={() => setHoja(null)}
        />
      )}
    </div>
  );
};

export default Aseo;
