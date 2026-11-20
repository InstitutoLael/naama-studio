/**
 * Puente entre el portal de Naamá y la «Planilla Ingreso-egreso 2026».
 *
 * Se pega en la planilla: Extensiones → Apps Script, y se publica como «Aplicación web»
 * (ejecutar como: yo · acceso: cualquier persona). El enlace /exec se conecta en el portal.
 *
 * También le pasa al portal quién vino (fecha, clienta y servicio de cada hoja «INGRESO …»),
 * para que «¿Quién vino?» se llene solo. Montos y medios de pago NO salen de la planilla.
 *
 * Seguridad: este script no recibe datos. Recibe solo un código de 64 caracteres y va a buscar
 * la fila al portal (naamastudio.cl). Si alguien llama al enlace sin un código válido, no pasa nada.
 */

const PORTAL = 'https://naamastudio.cl/api/portal/planilla/fila/';
const PORTAL_PEDIDO = 'https://naamastudio.cl/api/portal/planilla/pedido/';
const MESES = { ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6, JUL: 7, AGO: 8, SEP: 9, OCT: 10, NOV: 11, DIC: 12 };

function doPost(e) {
  try {
    const pedido = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const token = String(pedido.token || '');
    if (!/^[0-9a-f]{64}$/.test(token)) return respuesta({ ok: false, error: 'Código no válido.' });

    const r = UrlFetchApp.fetch(PORTAL + token, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return respuesta({ ok: false, error: 'El portal no reconoció el servicio.' });
    const fila = JSON.parse(r.getContentText()).fila;

    const lock = LockService.getDocumentLock();
    lock.waitLock(20000);
    try {
      const hoja = hojaDelMes();
      if (!hoja) return respuesta({ ok: false, error: 'No encontré ninguna hoja «INGRESO …».' });
      const n = primeraFilaLibre(hoja);
      const p = fila.fecha.split('-').map(Number);
      hoja.getRange(n, 1, 1, 5).setValues([[new Date(p[0], p[1] - 1, p[2]), fila.clienta, fila.profesional, fila.servicio, fila.medio]]);
      hoja.getRange(n, 6, 1, 2).setValues([[fila.efectivo, fila.maquina]]);
      hoja.getRange(n, 10, 1, 2).setValues([[fila.propina, fila.comision]]);
      hoja.getRange(n, 15, 1, 2).setValues([[fila.turno, fila.categoria]]);
      SpreadsheetApp.flush();
      return respuesta({ ok: true, hoja: hoja.getName(), fila: n });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return respuesta({ ok: false, error: String(err).slice(0, 180) });
  }
}

/** La última hoja «INGRESO …» de la planilla (la del mes en curso). */
function hojaDelMes() {
  const hojas = SpreadsheetApp.getActive().getSheets().filter(function (h) {
    return /^INGRESO /i.test(h.getName());
  });
  return hojas.length ? hojas[hojas.length - 1] : null;
}

/** Primera fila sin clienta, servicio ni montos (las columnas con fórmulas no cuentan). */
function primeraFilaLibre(hoja) {
  const ultima = Math.max(hoja.getLastRow(), 2);
  const datos = hoja.getRange(2, 2, ultima - 1, 6).getValues(); // B..G
  for (let i = 0; i < datos.length; i++) {
    const d = datos[i];
    if (d[0] === '' && d[2] === '' && d[4] === '' && d[5] === '') return i + 2;
  }
  return ultima + 1;
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * El portal pide «quién vino» con un código de un solo uso. Antes de contestar, se le pregunta
 * al portal si ese código es real; si no, no se entrega nada.
 */
function doGet(e) {
  try {
    const token = String((e && e.parameter && e.parameter.pedido) || '');
    if (!/^[0-9a-f]{64}$/.test(token)) return respuesta({ ok: false, error: 'Código no válido.' });
    const r = UrlFetchApp.fetch(PORTAL_PEDIDO + token, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return respuesta({ ok: false, error: 'El portal no reconoció el pedido.' });
    return respuesta({ ok: true, filas: quienVino() });
  } catch (err) {
    return respuesta({ ok: false, error: String(err).slice(0, 180) });
  }
}

/** Fecha, clienta y servicio de todas las hojas «INGRESO MES AA». */
function quienVino() {
  const tz = Session.getScriptTimeZone() || 'America/Santiago';
  const filas = [];
  SpreadsheetApp.getActive().getSheets().forEach(function (hoja) {
    const m = /^INGRESO\s+([A-Z]{3})\w*\s+(\d{2,4})/i.exec(hoja.getName());
    if (!m || !MESES[m[1].toUpperCase()]) return;
    const mesHoja = MESES[m[1].toUpperCase()];
    const anoHoja = Number(m[2]) < 100 ? 2000 + Number(m[2]) : Number(m[2]);
    const ultima = hoja.getLastRow();
    if (ultima < 2) return;
    const datos = hoja.getRange(2, 1, ultima - 1, 4).getValues(); // A fecha · B clienta · C profesional · D servicio
    datos.forEach(function (d) {
      const clienta = String(d[1] || '').trim();
      if (!clienta) return;
      const f = aFecha(d[0], mesHoja, anoHoja, tz);
      if (f) filas.push({ f: f, c: clienta.slice(0, 80), s: String(d[3] || '').trim().slice(0, 80) });
    });
  });
  return filas;
}

/** Celda de fecha → «AAAA-MM-DD». Acepta fechas reales o texto «28/09» / «28/09/2026». */
function aFecha(v, mesHoja, anoHoja, tz) {
  if (v instanceof Date && !isNaN(v)) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  const t = /^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?/.exec(String(v || '').trim());
  if (!t) return null;
  const dia = Number(t[1]);
  const mes = Number(t[2]);
  let ano = t[3] ? Number(t[3]) : anoHoja;
  if (ano < 100) ano += 2000;
  if (!t[3] && mes > mesHoja + 1) ano -= 1; // p. ej. «29/12» en la hoja de enero
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  return ano + '-' + ('0' + mes).slice(-2) + '-' + ('0' + dia).slice(-2);
}
