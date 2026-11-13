# Portal del equipo (naamastudio.cl/portal)

Zona privada para el equipo de Naamá. Cada persona entra con su correo y su clave, y ve solo lo que le toca según su rol.

## Piezas (todo gratis)

| Pieza | Dónde | Qué hace |
| --- | --- | --- |
| Pantallas | `src/portal/` | Entrar, panel, cuentas. Usan los colores, letras y botones de la web (`src/theme/portal.css`). |
| API | `portal-api/` (lógica) y `functions/api/portal/[[ruta]].js` (puerta de entrada) | Entrar, salir, cuentas y permisos. |
| Base de datos | Cloudflare D1, conectada con el nombre **`DB`** | Cuentas, sesiones, intentos y actividad. Las tablas se crean solas. |
| Roles y permisos | `src/portal/permisos.js` | Una sola lista que usan el servidor y las pantallas. |

## Roles

- **Administración** (Diego, Allison): todo.
- **Dueña** (Vivy): ve todo; no crea ni desactiva cuentas.
- **Socia** (Gaby): sin plata, caja ni saldos.
- **Equipo** (Valeria, Kata): su agenda, clientas, insumos y compras.

A cada persona se le pueden prender permisos extra desde *Cuentas*.

## Configuración en Cloudflare (una sola vez)

1. **Workers & Pages → D1 → Crear base de datos**: nombre `naama-portal`.
2. **Pages → naama-studio → Configuración → Enlaces (Bindings) → Agregar → Base de datos D1**: nombre de la variable `DB`, base `naama-portal`. Hacerlo en *Producción* y en *Vista previa*.
3. **Pages → naama-studio → Configuración → Variables y secretos → Agregar**: `SETUP_SECRET` (tipo *Secreto*), una clave larga que solo sepa Diego.
4. Volver a publicar. Abrir `/portal`: aparece «Configura el portal». Con esa clave se crea la primera cuenta de Administración (solo funciona mientras no existan cuentas).

## Antes de publicar

```bash
npx eslint .        # errores de código
npm test            # pruebas de la API contra SQLite en memoria
npm run build       # build + páginas pre-dibujadas
npm run portal:local   # probar en http://localhost:8788/portal (clave de configuración: prueba-local)
```

## Seguridad

- Claves con PBKDF2-SHA256 y sal por persona; nunca en texto plano.
- Cookie de sesión `HttpOnly; Secure; SameSite=Strict`, 30 días.
- Toda escritura exige el encabezado `x-naama: 1` y que venga del mismo sitio.
- Máximo 5 intentos fallidos por correo y 20 por IP cada 15 minutos.
- Secretos solo en las variables de Cloudflare, nunca en el código.
- No se guardan datos de salud ni datos bancarios de clientas.

## Módulos publicados

| Módulo | Quién | Qué hace |
| --- | --- | --- |
| Clientas | Todas (números solo Administración y Vivy) | Subir contactos, «Vino hoy», hace cuánto no viene. |
| Insumos | Todas (costos solo Administración y Vivy) | Productos con foto, «Anotar lo que usé» con la pesa, tonos, ventas y datos por servicio. |
| Compras | Todas (montos solo Administración y Vivy) | Lista de compras; lo bajo el mínimo se sugiere solo. |
| La plata | Administración y Vivy | Disponible para gastar, gastos fijos y pagos de Mercado Pago. |

## Secretos en Cloudflare (Producción)

- `SETUP_SECRET`: solo para crear la primera cuenta.
- `MP_ACCESS_TOKEN`: llave de producción de la aplicación «Portal Naama» en Mercado Pago (cuenta Naamá). Solo se usa para leer pagos. Si se cambia en Mercado Pago, hay que actualizarla aquí y volver a publicar.

## SII

Desde el 1 de diciembre de 2026 el modelo de emisión es «Siempre emito Boleta… aun cuando reciba un pago electrónico» (las boletas las emite el plan de Mercado Pago). Así el F29 ya no duplica boletas y comprobantes.


## Anotar servicios → planilla (Apps Script)

Los servicios que anota Administración se guardan en D1 y se mandan a la «Planilla Ingreso-egreso 2026», a la última hoja «INGRESO …».

1. En la planilla: **Extensiones → Apps Script**, pegar `docs/planilla-apps-script.gs` y guardar.
2. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: *yo* · Acceso: *cualquier persona*. Autorizar.
3. Copiar el enlace que termina en `/exec` y pegarlo en el portal: **Anotar servicios → Conectar**.

No hay clave compartida: el portal le manda al script solo un código de 64 caracteres; el script viene a buscar la fila a
`/api/portal/planilla/fila/<código>` (sirve una vez y por 2 días). Si algo falla, el servicio queda «pendiente» y se reintenta
con un toque.

Cuando se crea la hoja del mes nuevo (copiando la anterior), los servicios caen ahí solos.

## Cierre de caja, disponibilidad y Mi mes

- **Cierre de caja** (permiso `caja`): compara lo anotado del día con Mercado Pago (máquina y transferencias) y con el efectivo contado.
- **Disponibilidad** (todas): cada una marca los próximos 14 días (sin domingos); todas ven la tabla del equipo.
- **Mi mes** (todas): cada trabajadora anota lo que hizo. **No va a la planilla.** Administración y Vivy lo cruzan con lo anotado
  antes de pagar (mismo día; mismo monto o mismo servicio).

## Experiencia de la clienta y del equipo (nov 2026)

- **Permisos:** `servicios` (anotar/borrar) es solo de Administración. Vivy tiene `verServicios`: ve lo anotado sin editar. Las trabajadoras solo ven su propio «Mi mes».
- **Cierre de caja:** quien cierra suma por separado tarjeta (cierre de la Point), transferencias y efectivo; se compara con Mercado Pago y con lo anotado.
- **Ficha de clienta** (todas): alergias o cuidados (aviso destacado), cumpleaños, gustos, notas y fórmulas de color con fecha y quién la anotó.
- **Te toca** (permiso `clientas`): clientas a las que les toca volver según el último servicio (uñas 21 días, depilación 28, facial 30, color 42, corte 45, corporal 14; si no, 35) y dormidas (+60). WhatsApp con mensaje listo; al escribir sale de la lista hasta su próxima visita. Cumpleaños de la semana.
- **Aseo y tareas:** Administración crea tareas por persona y días; cada una marca las suyas. El inicio muestra lo que toca hoy.
- **Mi QR de reseñas:** QR a la reseña de Google de Naamá Studio (Arcadia 1297). Enlace configurable con `POST /api/portal/resenas`.
- **Metas:** cada una se pone su meta del mes en «Mi mes» y ve su avance.
- **Gift cards** (`servicios` o `finanzas`): 4 diseños Pausa Cálida, código NAAMA-XXXX-XXXX, PNG para compartir, canje una sola vez.
- **Margen por servicio** (`finanzas`): precio − IVA − comisión MP − % profesional − insumos (pesa), últimos 90 días.
