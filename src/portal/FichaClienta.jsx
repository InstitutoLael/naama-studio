import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Cake, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, post } from './api';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const cumpleTexto = (c) => (c ? `${Number(c.slice(3))} de ${MESES[Number(c.slice(0, 2)) - 1]}` : '');
const fechaCorta = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
const hoyChile = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());

/** Lo que el equipo debe saber de una clienta: alergias, cumpleaños, gustos, notas y fórmulas de color. Lo ve y lo edita todo el equipo. */
const FichaClienta = ({ clienta, yo }) => {
  const [d, setD] = useState(null);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api(`clientas/${clienta.id}/ficha`)
      .then(setD)
      .catch((err) => setError(err.message));
  }, [clienta.id]);
  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!d) return error ? <p className="portal-error">{error}</p> : <p className="muted">Cargando ficha…</p>;
  const f = d.ficha;

  return (
    <div className="ficha-cli">
      {f.alergias && (
        <p className="ficha-cli__alergia" role="note">
          <AlertTriangle size={18} /> <span><strong>Alergias o cuidados:</strong> {f.alergias}</span>
        </p>
      )}

      {!editando ? (
        <div className="ficha-cli__datos">
          <p>
            <Cake size={16} /> {f.cumple ? `Cumpleaños: ${cumpleTexto(f.cumple)}` : 'Cumpleaños: pregúntale y anótalo'}
          </p>
          {f.preferencias && <p><strong>Le gusta:</strong> {f.preferencias}</p>}
          {f.notas && <p><strong>Notas:</strong> {f.notas}</p>}
          <button type="button" className="portal__link" onClick={() => setEditando(true)}>
            <Pencil size={14} /> {f.actualizado ? 'Editar ficha' : 'Completar ficha'}
          </button>
          {f.por && <small className="muted">Actualizó {f.por}</small>}
        </div>
      ) : (
        <form
          className="hoja__form"
          onSubmit={async (e) => {
            e.preventDefault();
            const x = new FormData(e.currentTarget);
            const dia = x.get('dia');
            const mes = x.get('mes');
            try {
              await post(`clientas/${clienta.id}/ficha`, {
                cumple: dia && mes ? `${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}` : null,
                alergias: x.get('alergias'),
                preferencias: x.get('preferencias'),
                notas: x.get('notas'),
              });
              setEditando(false);
              cargar();
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          <div className="field">
            <span className="field__titulo">Cumpleaños</span>
            <div className="fila-campos">
              <select name="dia" className="input" defaultValue={f.cumple ? Number(f.cumple.slice(3)) : ''} aria-label="Día">
                <option value="">Día</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select name="mes" className="input" defaultValue={f.cumple ? Number(f.cumple.slice(0, 2)) : ''} aria-label="Mes">
                <option value="">Mes</option>
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="fc-a">Alergias o cuidados</label>
            <input id="fc-a" name="alergias" className="input" defaultValue={f.alergias} placeholder="Ej.: alérgica al amoníaco, cuero cabelludo sensible" />
          </div>
          <div className="field">
            <label htmlFor="fc-p">Le gusta</label>
            <input id="fc-p" name="preferencias" className="input" defaultValue={f.preferencias} placeholder="Ej.: té verde, poca conversación, agua tibia" />
          </div>
          <div className="field">
            <label htmlFor="fc-n">Notas</label>
            <textarea id="fc-n" name="notas" className="input" rows={3} defaultValue={f.notas} placeholder="Lo que sirva para la próxima vez" />
          </div>
          {error && <p className="portal-error">{error}</p>}
          <div className="hoja__acciones">
            <button type="submit" className="btn">
              Guardar ficha
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div>
        <p className="grupo__titulo">Fórmulas y colores</p>
        <form
          className="ficha__otra"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const t = new FormData(form).get('texto');
            try {
              await post(`clientas/${clienta.id}/formulas`, { texto: t, fecha: hoyChile() });
              form.reset();
              cargar();
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          <input name="texto" className="input" placeholder="Ej.: 7.1 + 20 vol 1:1,5 · 45 g · 35 min" aria-label="Nueva fórmula" required />
          <button type="submit" className="btn btn--sm" aria-label="Agregar fórmula">
            <Plus size={16} />
          </button>
        </form>
        {d.formulas.length > 0 && (
          <ul className="ficha__visitas">
            {d.formulas.map((x) => (
              <li key={x.id}>
                <span>
                  {x.texto}
                  <br />
                  <small>
                    {fechaCorta(x.fecha)} · {x.por}
                  </small>
                </span>
                {(x.por === yo?.nombre || yo?.permisos?.includes('clientas')) && (
                  <button
                    type="button"
                    className="icono-boton"
                    aria-label="Borrar fórmula"
                    onClick={async () => {
                      if (!window.confirm('¿Borrar esta fórmula?')) return;
                      await post(`formulas/${x.id}`, { borrar: true });
                      cargar();
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {d.servicios.length > 0 && (
        <div>
          <p className="grupo__titulo">Servicios anotados</p>
          <ul className="ficha__visitas">
            {d.servicios.map((x, i) => (
              <li key={i}>
                <span>{x.servicio}</span>
                <small>
                  {fechaCorta(x.fecha)} · {x.profesional.split(' ')[0].charAt(0) + x.profesional.split(' ')[0].slice(1).toLowerCase()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FichaClienta;
