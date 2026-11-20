/**
 * «¿Quién vino?» se llena solo.
 *
 * Fuentes: lo que anota cada una en «Mi mes», los servicios que anota Administración,
 * las citas de la agenda que ya pasaron y las filas de la planilla (Excel) del año.
 * Cada fila se procesa una sola vez (tabla visitas_auto, clave única por origen).
 *
 * Emparejar nombres: la planilla casi siempre trae solo el nombre («Claudia»), así que:
 *  - nombre completo igual, o todas sus palabras dentro del nombre de una sola clienta → visita anotada;
 *  - solo el nombre de pila y hay una sola clienta con ese nombre → visita anotada;
 *  - si calza con varias o con ninguna → queda «por confirmar» y Administración elige con un toque.
 */

export const normNombre = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Lo que en la planilla no es una persona.
const NO_ES_CLIENTA = /^(|caja|salon|naama|garantia|prestamo|varios|venta|producto|productos|sin nombre|cliente|clienta|x|na|no|otro|otra)$/;

/** Prepara las clientas para buscarlas rápido. */
export const indiceClientas = (clientas) =>
  clientas.map((c) => {
    const n = normNombre(c.nombre);
    return { id: c.id, nombre: c.nombre, n, palabras: n.split(' ').filter(Boolean), visitas: c.visitas ?? 0 };
  });

/** Devuelve { id } si hay una sola clienta que calza, o { candidatas: [...] } (puede venir vacío). */
export const emparejar = (indice, nombre) => {
  const n = normNombre(nombre);
  if (!n || NO_ES_CLIENTA.test(n)) return { saltar: true, candidatas: [] };
  const palabras = n.split(' ');
  const exactas = indice.filter((c) => c.n === n);
  if (exactas.length === 1) return { id: exactas[0].id };
  if (exactas.length > 1) return { candidatas: exactas };
  const contienen = indice.filter((c) => palabras.every((p) => c.palabras.includes(p)));
  if (contienen.length === 1) return { id: contienen[0].id };
  if (contienen.length > 1) return { candidatas: contienen };
  // «Naty» ~ «Nataly», «Cami» ~ «Camila»: mismo comienzo (mín. 3 letras) en el nombre de pila.
  const parecidas = indice.filter((c) => c.palabras[0] && palabras[0].length >= 3 && (c.palabras[0].startsWith(palabras[0]) || palabras[0].startsWith(c.palabras[0])));
  return { candidatas: parecidas };
};

/** Anota la visita (si no estaba) y actualiza el conteo de la clienta. Devuelve true si era nueva. */
export async function anotarVisita(db, clientaId, fecha, cuentaId, ts) {
  const r = await db
    .prepare('INSERT INTO visitas (clienta_id, fecha, cuenta_id, ts) VALUES (?, ?, ?, ?) ON CONFLICT(clienta_id, fecha) DO NOTHING')
    .bind(clientaId, fecha, cuentaId ?? null, ts)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

export async function recontar(db, ids) {
  const unicos = [...new Set(ids)];
  for (let i = 0; i < unicos.length; i += 40) {
    await db.batch(
      unicos.slice(i, i + 40).map((id) =>
        db
          .prepare(
            `UPDATE clientas SET visitas = (SELECT COUNT(*) FROM visitas WHERE clienta_id = ?),
             ultima_visita = (SELECT MAX(fecha) FROM visitas WHERE clienta_id = ?) WHERE id = ?`,
          )
          .bind(id, id, id),
      ),
    );
  }
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Procesa filas nuevas: [{ clave, fecha, nombre, servicio, origen, clientaId?, cuentaId? }].
 * Las que ya estaban (misma clave) se saltan. Trabaja en tandas (D1 cobra por consulta) y procesa
 * hasta `max` filas por llamada; lo que falta sale en `quedan` y se sigue en la próxima.
 */
export async function procesarFilas(db, filas, { hoy, ts, max = 1200 }) {
  const validas = filas.filter((f) => f.clave && FECHA.test(f.fecha ?? '') && f.fecha <= hoy);
  const vacio = { anotadas: 0, porConfirmar: 0, nuevas: 0, quedan: 0 };
  if (!validas.length) return vacio;
  const origenes = [...new Set(validas.map((f) => f.origen))];
  const { results: hechas } = await db
    .prepare(`SELECT clave FROM visitas_auto WHERE origen IN (${origenes.map(() => '?').join(',')})`)
    .bind(...origenes)
    .all();
  const ya = new Set(hechas.map((r) => r.clave));
  const vistas = new Set();
  const todas = validas.filter((f) => !ya.has(f.clave) && !vistas.has(f.clave) && vistas.add(f.clave));
  if (!todas.length) return vacio;
  const nuevas = todas.slice(0, max);

  const { results: clientas } = await db.prepare('SELECT id, nombre, visitas FROM clientas WHERE activa = 1').all();
  const indice = indiceClientas(clientas);
  const tocadas = new Set();
  let anotadas = 0;
  let porConfirmar = 0;
  let pasos = [];
  let esVisita = [];
  const vaciar = async () => {
    if (!pasos.length) return;
    const res = await db.batch(pasos);
    res.forEach((r, k) => {
      if (esVisita[k] && (r?.meta?.changes ?? 0) > 0) anotadas += 1;
    });
    pasos = [];
    esVisita = [];
  };
  for (const f of nuevas) {
    let id = f.clientaId ?? null;
    let estado = 'lista';
    if (!id) {
      const m = emparejar(indice, f.nombre);
      if (m.saltar) estado = 'saltada';
      else if (m.id) id = m.id;
      else estado = 'pendiente';
    }
    if (id) {
      tocadas.add(id);
      pasos.push(
        db
          .prepare('INSERT INTO visitas (clienta_id, fecha, cuenta_id, ts) VALUES (?, ?, ?, ?) ON CONFLICT(clienta_id, fecha) DO NOTHING')
          .bind(id, f.fecha, f.cuentaId ?? null, ts),
      );
      esVisita.push(true);
    } else if (estado === 'pendiente') porConfirmar += 1;
    pasos.push(
      db
        .prepare(
          `INSERT INTO visitas_auto (clave, fecha, nombre, nombre_n, servicio, origen, clienta_id, estado, creado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(clave) DO NOTHING`,
        )
        .bind(f.clave, f.fecha, String(f.nombre ?? '').slice(0, 80), normNombre(f.nombre), String(f.servicio ?? '').slice(0, 80) || null, f.origen, id, estado, ts),
    );
    esVisita.push(false);
    if (pasos.length >= 80) await vaciar();
  }
  await vaciar();
  await recontar(db, [...tocadas]);
  return { anotadas, porConfirmar, nuevas: nuevas.length, quedan: todas.length - nuevas.length };
}

/** Lo que anotó el equipo en el portal (Mi mes, Servicios y la agenda), que todavía no se pasó a visitas. */
export async function sincronizarPortal(db, { hoy, ts }) {
  const [mis, srv, citas] = await Promise.all([
    db
      .prepare(
        `SELECT m.id, m.fecha, m.clienta, m.servicio, m.cuenta_id FROM mis_servicios m
         WHERE m.clienta IS NOT NULL AND m.clienta != '' AND NOT EXISTS (SELECT 1 FROM visitas_auto v WHERE v.clave = 'mis:' || m.id)
         ORDER BY m.id LIMIT 400`,
      )
      .all(),
    db
      .prepare(
        `SELECT s.id, s.fecha, s.clienta, s.clienta_id, s.servicio FROM servicios s
         WHERE NOT EXISTS (SELECT 1 FROM visitas_auto v WHERE v.clave = 'srv:' || s.id) ORDER BY s.id LIMIT 400`,
      )
      .all(),
    db
      .prepare(
        `SELECT c.id, c.fecha, c.clienta, c.clienta_id, c.servicio, c.cuenta_id FROM citas c
         WHERE c.fecha <= ? AND c.estado NOT IN ('cancelada', 'no-vino')
         AND NOT EXISTS (SELECT 1 FROM visitas_auto v WHERE v.clave = 'cita:' || c.id) ORDER BY c.id LIMIT 400`,
      )
      .bind(hoy)
      .all(),
  ]);
  const filas = [
    ...mis.results.map((m) => ({ clave: `mis:${m.id}`, fecha: m.fecha, nombre: m.clienta, servicio: m.servicio, origen: 'Mi mes', cuentaId: m.cuenta_id })),
    ...srv.results.map((s) => ({ clave: `srv:${s.id}`, fecha: s.fecha, nombre: s.clienta, servicio: s.servicio, origen: 'Servicios', clientaId: s.clienta_id })),
    ...citas.results.map((c) => ({ clave: `cita:${c.id}`, fecha: c.fecha, nombre: c.clienta, servicio: c.servicio, origen: 'Agenda', clientaId: c.clienta_id, cuentaId: c.cuenta_id })),
  ];
  return procesarFilas(db, filas, { hoy, ts });
}

/** Filas que manda la planilla: [{ f: 'AAAA-MM-DD', c: 'Clienta', s: 'Servicio' }]. */
export const filasDePlanilla = (lista) =>
  (Array.isArray(lista) ? lista : [])
    .filter((x) => x && FECHA.test(x.f ?? '') && normNombre(x.c))
    .map((x) => ({
      clave: `xl:${x.f}|${normNombre(x.c)}|${normNombre(x.s).slice(0, 40)}`,
      fecha: x.f,
      nombre: String(x.c).trim(),
      servicio: String(x.s ?? '').trim(),
      origen: 'Planilla',
    }));

/** Vuelve a mirar lo «por confirmar»: si ahora calza con una sola clienta (p. ej. la subieron después), se anota sola. */
export async function reintentarPendientes(db, { ts }) {
  const { results: grupos } = await db
    .prepare(`SELECT nombre_n, MAX(nombre) AS nombre FROM visitas_auto WHERE estado = 'pendiente' GROUP BY nombre_n`)
    .all();
  if (!grupos.length) return 0;
  const { results: clientas } = await db.prepare('SELECT id, nombre, visitas FROM clientas WHERE activa = 1').all();
  const indice = indiceClientas(clientas);
  const tocadas = [];
  let anotadas = 0;
  for (const g of grupos) {
    const m = emparejar(indice, g.nombre);
    if (!m.id) continue;
    const { results: filas } = await db.prepare(`SELECT clave, fecha FROM visitas_auto WHERE estado = 'pendiente' AND nombre_n = ?`).bind(g.nombre_n).all();
    for (let i = 0; i < filas.length; i += 40) {
      const tanda = filas.slice(i, i + 40);
      const res = await db.batch(
        tanda.map((f) => db.prepare('INSERT INTO visitas (clienta_id, fecha, cuenta_id, ts) VALUES (?, ?, NULL, ?) ON CONFLICT(clienta_id, fecha) DO NOTHING').bind(m.id, f.fecha, ts)),
      );
      anotadas += res.filter((r) => (r?.meta?.changes ?? 0) > 0).length;
      await db.batch(tanda.map((f) => db.prepare(`UPDATE visitas_auto SET estado = 'lista', clienta_id = ? WHERE clave = ?`).bind(m.id, f.clave)));
    }
    tocadas.push(m.id);
  }
  await recontar(db, tocadas);
  return anotadas;
}
