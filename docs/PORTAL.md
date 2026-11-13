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
