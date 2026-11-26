/**
 * Orden del correo de Naamá (naamastudiospa@gmail.com).
 * Pone etiquetas y saca de Recibidos lo que no necesita atención. Lo que no calza con ninguna regla
 * (clientas, proveedores, personas) se queda en Recibidos.
 *
 * Instalar: ▶ «instalar» una vez. Ordena lo que hay y deja corriendo una revisión cada 15 minutos.
 * Nada se borra: todo queda en «Todos» y en su etiqueta.
 */

const REGLAS = [
  {
    etiqueta: 'Naamá/Transferencias',
    q: 'from:(bancoestado.cl OR scotiabank.cl OR santander.cl OR bancochile.cl OR itau.cl OR bci.cl OR bancofalabella.cl OR bancoripley.cl OR tenpo.cl OR mach.cl OR coopeuch.cl) subject:(transferencia OR transferencias OR informa OR comprobante OR abono)',
    archivar: true,
  },
  {
    etiqueta: 'Naamá/Mercado Pago',
    q: 'from:(mercadopago.cl OR mercadopago.com) -subject:(opinión OR mejorar OR "inicio de sesión")',
    archivar: true,
  },
  {
    etiqueta: 'Naamá/Compras',
    q: 'from:(mercadolibre.cl OR sheinnotify.com OR shein.com OR primevideo.com OR amazon.com OR falabella.com OR paris.cl OR ripley.cl OR temu.com OR aliexpress.com)',
    archivar: true,
  },
  {
    etiqueta: 'Naamá/Cuentas y seguridad',
    q: 'from:(accounts.google.com OR noreply-accounts@google.com OR families-noreply@google.com OR setmore.com) OR (from:(mercadopago.cl OR mercadopago.com) subject:"inicio de sesión")',
    archivar: true,
  },
  {
    etiqueta: 'Naamá/Web y portal',
    q: '(from:naamastudiospa@gmail.com subject:"Prueba de correos") OR from:(cloudflare.com OR search-console-noreply@google.com OR businessprofile-noreply@google.com)',
    archivar: true,
  },
  {
    etiqueta: 'Naamá/Publicidad y encuestas',
    q: 'from:(qemailserver.com OR growyoursocial-insta.com OR google-gemini-noreply@google.com) OR subject:("Queremos conocer tu opinión" OR "Ayúdanos a mejorar" OR "Partnership Proposal") OR category:promotions',
    archivar: true,
    leido: true,
  },
];

function ordenar() {
  REGLAS.forEach(function (r) {
    const etiqueta = GmailApp.getUserLabelByName(r.etiqueta) || GmailApp.createLabel(r.etiqueta);
    // Hasta 300 hilos por regla en cada pasada (de a 100, el máximo que permite Gmail).
    for (let pasada = 0; pasada < 3; pasada++) {
      const hilos = GmailApp.search('in:inbox (' + r.q + ')', 0, 100);
      if (!hilos.length) break;
      etiqueta.addToThreads(hilos);
      if (r.leido) GmailApp.markThreadsRead(hilos);
      if (r.archivar) GmailApp.moveThreadsToArchive(hilos);
      if (hilos.length < 100) break;
    }
  });
}

function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'ordenar') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('ordenar').timeBased().everyMinutes(15).create();
  ordenar();
}
