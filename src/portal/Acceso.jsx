import React, { useState } from 'react';
import { ArrowRight } from '../components/common/Icons';
import { post } from './api';

/* Pantallas sin sesión: entrar, configurar la primera cuenta y crear la clave personal. */

const Campo = ({ id, label, ...props }) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    <input id={id} className="input" {...props} />
  </div>
);

const Aviso = ({ texto }) => (texto ? <p className="portal-error" role="alert">{texto}</p> : null);

const Marco = ({ eyebrow, titulo, bajada, children }) => (
  <section className="acceso">
    <div className="acceso__caja">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="acceso__titulo">{titulo}</h1>
      {bajada && <p className="acceso__bajada muted">{bajada}</p>}
      {children}
    </div>
  </section>
);

const useEnvio = () => {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const enviar = (fn) => async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await fn(new FormData(e.currentTarget));
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };
  return { enviando, error, enviar };
};

export const Entrar = ({ onListo }) => {
  const { enviando, error, enviar } = useEnvio();
  const [olvido, setOlvido] = useState(false);
  return (
    <Marco eyebrow="Portal del equipo" titulo={<>Hola, <em>bienvenida.</em></>} bajada="Entra con tu correo y tu clave.">
      <form
        className="acceso__form"
        onSubmit={enviar(async (f) => {
          const r = await post('entrar', { email: f.get('email'), clave: f.get('clave') });
          onListo(r.cuenta);
        })}
      >
        <Campo id="email" name="email" type="email" label="Correo" autoComplete="username" required />
        <Campo id="clave" name="clave" type="password" label="Clave" autoComplete="current-password" required />
        <Aviso texto={error} />
        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'} <ArrowRight />
        </button>
        <button type="button" className="acceso__olvido" onClick={() => setOlvido((v) => !v)} aria-expanded={olvido}>
          ¿Olvidaste tu clave?
        </button>
        {olvido && (
          <p className="acceso__nota">
            Pídele a Diego o a Allison que te la restablezcan. Te van a mandar una clave temporal por WhatsApp y, al entrar,
            creas la tuya.
          </p>
        )}
      </form>
    </Marco>
  );
};

export const Configurar = ({ onListo }) => {
  const { enviando, error, enviar } = useEnvio();
  return (
    <Marco
      eyebrow="Primera vez"
      titulo={<>Configura el <em>portal.</em></>}
      bajada="Crea la primera cuenta de Administración. Necesitas la clave de configuración (SETUP_SECRET) que guardaste en Cloudflare."
    >
      <form
        className="acceso__form"
        onSubmit={enviar(async (f) => {
          if (f.get('clave') !== f.get('clave2')) throw new Error('Las claves no coinciden.');
          const r = await post('configurar', {
            secreto: f.get('secreto'),
            nombre: f.get('nombre'),
            email: f.get('email'),
            clave: f.get('clave'),
          });
          onListo(r.cuenta);
        })}
      >
        <Campo id="secreto" name="secreto" type="password" label="Clave de configuración" autoComplete="off" required />
        <Campo id="nombre" name="nombre" label="Tu nombre" autoComplete="given-name" required />
        <Campo id="email" name="email" type="email" label="Tu correo" autoComplete="username" required />
        <Campo id="clave" name="clave" type="password" label="Tu clave (mínimo 8)" autoComplete="new-password" minLength={8} required />
        <Campo id="clave2" name="clave2" type="password" label="Repite tu clave" autoComplete="new-password" minLength={8} required />
        <Aviso texto={error} />
        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? 'Creando…' : 'Crear mi cuenta'} <ArrowRight />
        </button>
      </form>
    </Marco>
  );
};

export const CrearClave = ({ cuenta, onListo, onSalir, obligatoria = true }) => {
  const { enviando, error, enviar } = useEnvio();
  return (
    <Marco
      eyebrow={obligatoria ? 'Primer ingreso' : 'Tu cuenta'}
      titulo={obligatoria ? <>Hola {cuenta.nombre}, crea <em>tu clave.</em></> : <>Cambia <em>tu clave.</em></>}
      bajada={obligatoria ? 'La clave que te mandaron es temporal. Crea una que solo tú sepas.' : null}
    >
      <form
        className="acceso__form"
        onSubmit={enviar(async (f) => {
          if (f.get('nueva') !== f.get('nueva2')) throw new Error('Las claves nuevas no coinciden.');
          await post('clave', { actual: f.get('actual'), nueva: f.get('nueva') });
          onListo();
        })}
      >
        <Campo
          id="actual"
          name="actual"
          type="password"
          label={obligatoria ? 'Clave temporal' : 'Clave actual'}
          autoComplete="current-password"
          required
        />
        <Campo id="nueva" name="nueva" type="password" label="Clave nueva (mínimo 8)" autoComplete="new-password" minLength={8} required />
        <Campo id="nueva2" name="nueva2" type="password" label="Repite la clave nueva" autoComplete="new-password" minLength={8} required />
        <Aviso texto={error} />
        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar clave'} <ArrowRight />
        </button>
        <button type="button" className="acceso__olvido" onClick={onSalir}>
          {obligatoria ? 'Salir' : 'Volver'}
        </button>
      </form>
    </Marco>
  );
};
