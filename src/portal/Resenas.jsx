import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { api } from './api';

/** Q09 · Pantalla completa terracota con el QR real a la reseña de Google, para mostrársela a la clienta. */
const Resenas = ({ cuenta }) => {
  const [url, setUrl] = useState(null);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('resenas')
      .then((r) => {
        setUrl(r.url);
        return QRCode.toDataURL(r.url, { width: 720, margin: 1, color: { dark: '#161413', light: '#FAF8F4' }, errorCorrectionLevel: 'M' });
      })
      .then(setQr)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="resenas-pantalla">
      <p className="resenas-pantalla__quien">Te atendió {cuenta.nombre.split(' ')[0]}</p>
      <h1>
        ¿Cómo te <b>fue?</b>
      </h1>
      {error && <p className="portal-error">{error}</p>}
      {qr && <img className="resenas-pantalla__qr" src={qr} alt="Código QR para dejar una reseña de Naamá Studio en Google" />}
      <p className="resenas-pantalla__texto">
        Escanea con la cámara y déjanos <strong>5 estrellas</strong> en Google si te gustó. Nos ayuda muchísimo.
      </p>
      {url && (
        <a className="btn btn--claro" href={url} target="_blank" rel="noreferrer">
          Abrir la reseña aquí mismo
        </a>
      )}
      <p className="resenas-pantalla__nota">Muéstrale esta pantalla al despedirla. Sube el brillo para que la cámara lo lea al tiro.</p>
    </div>
  );
};

export default Resenas;
