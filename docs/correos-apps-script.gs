/**
 * Correos de Naamá por Google (gift cards y bienvenida al portal).
 *
 * Cómo se instala (una sola vez, con la cuenta de Google desde la que deben salir los correos):
 *  1. Entra a https://script.google.com → «Nuevo proyecto». Ponle de nombre «Correos Naamá».
 *  2. Borra lo que trae y pega este archivo completo. Guarda.
 *  3. «Implementar» → «Nueva implementación» → tipo «Aplicación web».
 *     Ejecutar como: Yo · Quién tiene acceso: Cualquier persona. → «Implementar».
 *  4. Google pide permiso para «Enviar correo en tu nombre» y «Conectarse a un servicio externo»: acepta.
 *  5. Copia el enlace que termina en /exec y pégalo en el portal: Equipo → «Correos por Google» → Conectar.
 *
 * Seguridad: este script no recibe correos ni direcciones. Recibe solo un código de 64 caracteres y va a
 * buscar el correo al portal (naamastudio.cl). Si alguien llama al enlace sin un código válido, no pasa nada.
 * Límite de Google: ~100 correos al día con Gmail gratis (de sobra para el salón).
 */

const PORTAL_CORREO = 'https://naamastudio.cl/api/portal/correo/';

function doPost(e) {
  try {
    const pedido = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const token = String(pedido.token || '');
    if (!/^[0-9a-f]{64}$/.test(token)) return respuesta({ ok: false, error: 'Código no válido.' });

    const r = UrlFetchApp.fetch(PORTAL_CORREO + token, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return respuesta({ ok: false, error: 'El portal no reconoció el correo.' });
    const c = JSON.parse(r.getContentText()).correo;

    const opciones = { name: 'Naamá Studio', htmlBody: c.html };
    if (c.imagen) {
      opciones.inlineImages = {
        tarjeta: Utilities.newBlob(Utilities.base64Decode(c.imagen), 'image/png', 'gift-card-naama.png'),
      };
      opciones.attachments = [Utilities.newBlob(Utilities.base64Decode(c.imagen), 'image/png', 'Gift-card-Naama.png')];
    }
    MailApp.sendEmail(c.para, c.asunto, 'Abre este correo en una aplicación que muestre imágenes para verlo completo.', opciones);
    return respuesta({ ok: true, quedan: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return respuesta({ ok: false, error: String(err).slice(0, 180) });
  }
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Para probar desde el editor: ▶ «probar» manda un correo de prueba a la misma cuenta. */
function probar() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Prueba de correos Naamá', 'Si te llegó esto, los correos del portal ya pueden salir.', { name: 'Naamá Studio' });
}
