import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, Gift, Mail, Plus, Search, Share2 } from "lucide-react";
import { api, post } from "./api";
import Hoja from "./Hoja";
import { pesos } from "./insumosBase";

import {
  DISENOS,
  disenoDe,
  dibujarGift,
  pdfDesde,
  pngDesde,
} from "../lib/giftcard";
export { DISENOS, dibujarGift };

const fechaLarga = (f) =>
  new Date(`${f}T12:00:00`).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const Tarjeta = ({ g }) => {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) dibujarGift(ref.current, g);
  }, [g]);
  const blob = () => pngDesde(ref.current);
  const nombre = `Gift-card-Naama-${g.para.replace(/\s+/g, "-")}.png`;
  const bajar = async (b, n) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = n;
    a.click();
  };
  return (
    <div className="gift">
      <canvas
        ref={ref}
        className="gift__canvas"
        aria-label={`Gift card para ${g.para}`}
      />
      <div className="hoja__acciones">
        {typeof navigator !== "undefined" && navigator.canShare && (
          <button
            type="button"
            className="btn"
            onClick={async () => {
              const f = new File([await blob()], nombre, { type: "image/png" });
              if (navigator.canShare({ files: [f] }))
                navigator
                  .share({ files: [f], title: "Gift card Naamá" })
                  .catch(() => {});
            }}
          >
            <Share2 size={16} /> Compartir
          </button>
        )}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={async () => bajar(await blob(), nombre)}
        >
          <Download size={16} /> PNG
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={async () =>
            bajar(await pdfDesde(ref.current), nombre.replace(".png", ".pdf"))
          }
        >
          <Download size={16} /> PDF
        </button>
      </div>
    </div>
  );
};

const MSG_CORREO = {
  enviado: "Listo: le llegó la gift card por correo.",
  pendiente:
    "Quedó guardado: sale solo apenas se conecten los correos de Google (en Equipo).",
  error: "No salió el correo. Se reintenta desde Equipo → Correos por Google.",
};

/** Dibuja la tarjeta final en un canvas aparte y la manda por correo desde la cuenta de Google del salón. */
async function mandarGiftPorCorreo(g, email) {
  const canvas = document.createElement("canvas");
  await dibujarGift(canvas, g);
  const blob = await pngDesde(canvas);
  const png = await new Promise((r) => {
    const fr = new FileReader();
    fr.onload = () => r(fr.result);
    fr.readAsDataURL(blob);
  });
  const r = await post(`giftcards/${g.id}/correo`, { email, png });
  return MSG_CORREO[r.estado] ?? "Correo en camino.";
}

const MandarCorreo = ({ g, inicial = "" }) => {
  const [email, setEmail] = useState(inicial);
  const [estado, setEstado] = useState(inicial ? "enviando" : "");
  const [msg, setMsg] = useState("");
  const enviar = useCallback(
    async (correo) => {
      setEstado("enviando");
      setMsg("");
      try {
        setMsg(await mandarGiftPorCorreo(g, correo));
        setEstado("listo");
      } catch (err) {
        setMsg(err.message);
        setEstado("");
      }
    },
    [g],
  );
  const yaMandado = useRef(false);
  useEffect(() => {
    if (inicial && !yaMandado.current) {
      yaMandado.current = true;
      enviar(inicial);
    }
  }, [inicial, enviar]);
  return (
    <form
      className="gift__correo"
      onSubmit={(e) => {
        e.preventDefault();
        enviar(email);
      }}
    >
      <label className="field">
        <span>Mandar por correo</span>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@de-quien-la-recibe.cl"
          required
        />
      </label>
      <button
        type="submit"
        className="btn btn--ghost"
        disabled={estado === "enviando"}
      >
        <Mail size={16} /> {estado === "enviando" ? "Enviando…" : "Enviar"}
      </button>
      {msg && (
        <p className="muted" role="status">
          {msg}
        </p>
      )}
    </form>
  );
};

const Nueva = ({ onListo, onCerrar }) => {
  const [g, setG] = useState({
    para: "",
    de: "",
    monto: "",
    servicio: "",
    mensaje: "",
    diseno: "burdeo",
    codigo: "NAAMA-XXXX-XXXX",
    vence: new Date(Date.now() + 92 * 86400000).toISOString().slice(0, 10),
  });
  const [medio, setMedio] = useState("Mercado Pago");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const cambia = (k) => (e) => setG((x) => ({ ...x, [k]: e.target.value }));
  const vista = {
    ...g,
    para: g.para || "Nombre",
    monto: Number(String(g.monto).replace(/\D/g, "")) || 0,
  };
  return (
    <Hoja titulo="Nueva gift card" onCerrar={onCerrar}>
      <div className="chips" role="radiogroup" aria-label="Diseño">
        {Object.entries(DISENOS).map(([k, d]) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={disenoDe(g.diseno) === k}
            className={`chip ${g.diseno === k ? "is-active" : ""}`}
            onClick={() => setG((x) => ({ ...x, diseno: k }))}
          >
            <span className="gift__muestra" style={{ background: d.fondo }} />{" "}
            {d.nombre}
          </button>
        ))}
      </div>
      <Tarjeta g={vista} />
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const r = await post("giftcards", { ...g, medio });
            onListo(r.giftcard, email.trim());
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <div className="fila-campos">
          <label className="field">
            <span>Para</span>
            <input
              className="input"
              value={g.para}
              onChange={cambia("para")}
              required
            />
          </label>
          <label className="field">
            <span>De (opcional)</span>
            <input className="input" value={g.de} onChange={cambia("de")} />
          </label>
        </div>
        <div className="fila-campos">
          <label className="field">
            <span>Monto</span>
            <input
              className="input"
              inputMode="numeric"
              value={g.monto}
              onChange={cambia("monto")}
              placeholder="$"
            />
          </label>
          <label className="field">
            <span>o servicio</span>
            <input
              className="input"
              value={g.servicio}
              onChange={cambia("servicio")}
              placeholder="Ej.: Manicure + pedicure"
            />
          </label>
        </div>
        <label className="field">
          <span>Mensaje (opcional)</span>
          <input
            className="input"
            value={g.mensaje}
            onChange={cambia("mensaje")}
            maxLength={160}
            placeholder="Ej.: Para que te regales una pausa"
          />
        </label>
        <div className="fila-campos">
          <label className="field">
            <span>Válida hasta</span>
            <input
              className="input"
              type="date"
              value={g.vence}
              onChange={cambia("vence")}
            />
          </label>
          <label className="field">
            <span>¿Cómo la pagaron?</span>
            <select
              className="input"
              value={medio}
              onChange={(e) => setMedio(e.target.value)}
            >
              <option>Mercado Pago</option>
              <option>Transferencia</option>
              <option>Efectivo</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>Correo de quien la recibe (opcional)</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Le llega la tarjeta con su código"
          />
        </label>
        {error && <p className="portal-error">{error}</p>}
        <button type="submit" className="btn">
          <Gift size={16} /> Crear gift card
        </button>
      </form>
    </Hoja>
  );
};

const ESTADO = {
  activa: "Activa",
  canjeada: "Canjeada",
  anulada: "Anulada",
  vencida: "Vencida",
};

const GiftCards = () => {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [hoja, setHoja] = useState(null);
  const [busca, setBusca] = useState("");

  const cargar = useCallback(() => {
    api("giftcards")
      .then(setD)
      .catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const accion = async (g, a, texto) => {
    if (texto && !window.confirm(texto)) return;
    try {
      const r = await post(`giftcards/${g.id}`, { accion: a });
      setHoja({ ver: r.giftcard });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const q = busca.trim().toUpperCase().replace(/\s/g, "");
  const lista =
    d?.giftcards.filter(
      (g) =>
        !q ||
        g.codigo.replace(/-/g, "").includes(q.replace(/-/g, "")) ||
        g.para.toUpperCase().includes(q),
    ) ?? [];
  const vendidas =
    d?.giftcards
      .filter((g) => g.estado !== "anulada")
      .reduce((a, g) => a + (g.monto || 0), 0) ?? 0;

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Regalos</span>
        <h1 className="panel__titulo">
          Gift <em>cards</em>
        </h1>
      </header>
      {error && (
        <p className="portal-error" role="alert">
          {error}
        </p>
      )}
      {!d && !error && <p className="muted">Cargando…</p>}
      {d && (
        <>
          <section className="hoy hoy--cuadros hoy--regalo">
            <div className="hoy__cifras">
              <div>
                <strong>
                  {d.giftcards.filter((g) => g.estado === "activa").length}
                </strong>
                <span>activas</span>
              </div>
              <div>
                <strong>{pesos(vendidas)}</strong>
                <span>vendido en gift cards</span>
              </div>
            </div>
            <button
              type="button"
              className="hoy__boton"
              onClick={() => setHoja({ nueva: true })}
            >
              <Plus size={18} /> Nueva gift card
            </button>
          </section>
          <label className="buscador">
            <Search size={16} />
            <input
              className="input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Código o nombre"
            />
          </label>
          <ul className="cuentas">
            {lista.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  className="pedido pedido--boton"
                  onClick={() => setHoja({ ver: g })}
                >
                  <span
                    className="gift__muestra"
                    style={{ background: DISENOS[disenoDe(g.diseno)].fondo }}
                  />
                  <span className="pedido__texto">
                    <strong>
                      {g.para} · {g.servicio || pesos(g.monto)}
                    </strong>
                    <small>
                      {g.codigo} · vence {fechaLarga(g.vence)}
                    </small>
                  </span>
                  <span
                    className={`etiqueta ${g.estado === "activa" ? "etiqueta--ok" : ""}`}
                  >
                    {ESTADO[g.estado]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {lista.length === 0 && (
            <div className="vacio">
              <Gift strokeWidth={1.2} />
              <p>
                <strong>
                  {q
                    ? "no hay ninguna con ese código"
                    : "todavía no hay gift cards"}
                </strong>
              </p>
            </div>
          )}
        </>
      )}
      {hoja?.nueva && (
        <Nueva
          onListo={(g, email) => {
            setHoja({ ver: g, email });
            cargar();
          }}
          onCerrar={() => setHoja(null)}
        />
      )}
      {hoja?.ver && (
        <Hoja
          titulo={`Gift card · ${hoja.ver.para}`}
          onCerrar={() => setHoja(null)}
        >
          <p className="muted">
            {ESTADO[hoja.ver.estado]} · creada por {hoja.ver.por}
            {hoja.ver.medio ? ` · pagada por ${hoja.ver.medio}` : ""}
            {hoja.ver.canjeadaPor ? ` · canjeó ${hoja.ver.canjeadaPor}` : ""}
          </p>
          <Tarjeta g={hoja.ver} />
          <div className="hoja__acciones">
            {hoja.ver.estado === "activa" && (
              <button
                type="button"
                className="btn"
                onClick={() =>
                  accion(
                    hoja.ver,
                    "canjear",
                    `¿Canjear la gift card de ${hoja.ver.para}? Queda usada.`,
                  )
                }
              >
                Canjear ahora
              </button>
            )}
            {hoja.ver.estado === "activa" && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() =>
                  accion(hoja.ver, "anular", "¿Anular esta gift card?")
                }
              >
                Anular
              </button>
            )}
            {["canjeada", "anulada"].includes(hoja.ver.estado) && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() =>
                  accion(hoja.ver, "reactivar", "¿Volver a dejarla activa?")
                }
              >
                Reactivar
              </button>
            )}
          </div>
          {hoja.ver.estado === "activa" && (
            <MandarCorreo
              key={hoja.ver.id}
              g={hoja.ver}
              inicial={hoja.email ?? ""}
            />
          )}
        </Hoja>
      )}
    </div>
  );
};

export default GiftCards;
