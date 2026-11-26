# Correos de Naamá (E01–E03)

Plantillas HTML listas para un servicio de envío (hoy la web **no envía correos**: falta conectar uno, por ejemplo Resend o Brevo).
Los datos van entre llaves dobles y se reemplazan al enviar.

| Archivo | Cuándo se manda | Datos |
|---|---|---|
| `gift-card.html` (E01) | Al vender una gift card | `{{para}}`, `{{de}}`, `{{mensaje}}`, `{{tarjeta_url}}` (PNG 1200×756 del diseño elegido), `{{codigo}}`, `{{vence}}` |
| `bienvenida-portal.html` (E02) | Al crear una cuenta en Cuentas | `{{nombre}}`, `{{email}}`, `{{clave_temporal}}` |
| `respuesta-contacto.html` (E03) | Al recibir un mensaje de contacto o empresas | `{{nombre}}`, `{{motivo}}`, `{{equipo}}`, `{{fecha}}` |
