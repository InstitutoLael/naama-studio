/**
 * Puente entre el portal de Naamá y la «Planilla Ingreso-egreso 2026».
 *
 * Se pega en la planilla: Extensiones → Apps Script, y se publica como «Aplicación web»
 * (ejecutar como: yo · acceso: cualquier persona). El enlace /exec se conecta en el portal.
 *
 * Seguridad: este script no recibe datos. Recibe solo un código de 64 caracteres y va a buscar
 * la fila al portal (naamastudio.cl). Si alguien llama al enlace sin un código válido, no pasa nada.
 */

const PORTAL = 'https://naamastudio.cl/api/portal/planilla/fila/';

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
