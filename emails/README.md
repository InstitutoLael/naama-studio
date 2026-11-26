# Correos de Naamá (E01–E03)

Plantillas HTML que el portal manda por Google (Apps Script con MailApp, ver `docs/correos-apps-script.gs`). Después de cambiar una, correr `node scripts/plantillas-correo.mjs`.
Los datos van entre llaves dobles y se reemplazan al enviar.

| Archivo | Cuándo se manda | Datos |
|---|---|---|
| `gift-card.html` (E01) | Al vender una gift card | `{{para}}`, `{{de}}`, `{{mensaje}}`, `{{tarjeta_url}}` (PNG 1200×756 del diseño elegido), `{{codigo}}`, `{{vence}}` |
| `bienvenida-portal.html` (E02) | Al crear una cuenta en Cuentas | `{{nombre}}`, `{{email}}`, `{{clave_temporal}}` |
| `respuesta-contacto.html` (E03) | Al recibir un mensaje de contacto o empresas | `{{nombre}}`, `{{motivo}}`, `{{equipo}}`, `{{fecha}}` |
