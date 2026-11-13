import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { api } from './api';

/** QR grande para que la clienta lo escanee desde el celular de la trabajadora y deje su reseña en Google. */
const Resenas = ({ cuenta }) => {
  const [url, setUrl] = useState(null);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('resenas')
      .then((r) => {
        setUrl(r.url);
        return QRCode.toDataURL(r.url, { width: 720, margin: 1, color: { dark: '#211a17', light: '#fffcf8' }, errorCorrectionLevel: 'M' });
      })
      .then(setQr)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="panel resenas">
      <header className="panel__cabeza">
        <span className="eyebrow">Te atendió {cuenta.nombre.split(' ')[0]}</span>
        <h1 className="panel__titulo">
          ¿Cómo te <em>fue?</em>
        </h1>
      </header>
      {error && <p className="portal-error">{error}</p>}
      {qr && (
        <section className="resenas__tarjeta">
          <img src={qr} alt="Código QR para dejar una reseña de Naamá Studio en Google" />
          <p>
            Escanea con la cámara y déjanos <strong>5 estrellas</strong> en Google si te gustó. Nos ayuda muchísimo 🤍
          </p>
        </section>
      )}
      {url && (
        <a className="btn btn--ghost" href={url} target="_blank" rel="noreferrer">
          Abrir la reseña aquí mismo
        </a>
      )}
      <p className="muted">
        Muéstrale esta pantalla a la clienta al despedirla. Sube el brillo del celular para que la cámara lo lea al tiro.
      </p>
    </div>
  );
};

export default Resenas;
