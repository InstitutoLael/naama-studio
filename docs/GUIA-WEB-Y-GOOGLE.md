# Naamá Studio · Guía de la web y Google

Línea gráfica: **Pausa Cálida** (espresso `#211A17`, crema `#F3EAE0`, arcilla `#A65D45`, dorado `#C5A675`; Playfair Display + Montserrat). La identidad descansa en la casa, no en el equipo.

---

## 1. Cómo publicar los cambios (VS Code)

Abre en VS Code la carpeta **`naama-studio/naama-studio`** (la de adentro). La de afuera es una copia antigua de junio: no la uses.

1. Terminal → `npm install` (solo la primera vez, porque cambió la tipografía a Montserrat).
2. `npm run dev` → abre http://localhost:5173 y revisa.
3. En la pestaña de Git (Control de código fuente): escribe un mensaje, por ejemplo `Pausa Cálida: nueva identidad, fotos reales y SEO local`, y presiona **Commit** y luego **Sync / Push**.
4. Cloudflare Pages publica solo en unos minutos (el comando de build es `npm run build`, el mismo de siempre).

### Agregar fotos nuevas
1. Copia la foto original a `photos-src/` con su nombre final, por ejemplo `unas-rojo-francesa.jpg`.
2. Ejecuta `npm run images`. Se generan las versiones AVIF y WebP en `public/img` y se agrega a `src/data/photos.json`.
3. Úsala por su nombre: en `src/data/gallery.js` (galería), en `WORK` de `src/pages/Home.jsx` (carrusel del inicio) o en `photo` de `src/data/team.js`.

### Datos que se cambian en un solo lugar
| Qué | Archivo |
| --- | --- |
| Horario, teléfono, dirección, Instagram | `src/data/site.js` (y el horario también en `src/data/schema.js`) |
| Equipo | `src/data/team.js` (el nombre debe coincidir con `worker` en `servicesData.js`) |
| Servicios y precios | `src/data/servicesData.js` |
| Preguntas frecuentes | `src/data/faq.js` |
| Colores y letras | `src/theme/base.css` (bloque `:root`) |

---

## 2. Qué cambió en esta versión

- **Colores y tipografía Pausa Cálida** en todo el sitio (Montserrat reemplaza a Manrope).
- **Horario real:** lunes a sábado de 10:30 a 19:30, domingo cerrado (en la web, la reserva, el pie de página y los datos para Google).
- **Equipo actual:** Viviana, Valeria, Gaby, Katalina y Allison, con retratos nuevos con corrección de color. Leah y Michelle salen. Los servicios de podología quedan con la opción "Sin preferencia" en la reserva.
- **Inicio rediseñado:**
  - Portada "Tu pausa *te espera.*" con la etiqueta "Salón de belleza y bienestar · San Miguel".
  - El manifiesto "No vendemos servicios, custodiamos pausas".
  - La sala de espera nueva.
  - Trabajos nuevos (uñas violeta y serpiente).
  - Nueva sección **Matrimonios & eventos**, con un botón para cotizar por WhatsApp.
  - Nueva sección **Visítanos**, con la fachada terracota a pantalla completa, la dirección, el horario y el botón "Cómo llegar".
  - **Preguntas frecuentes.**
  - El equipo ya no es una sección del inicio (sigue en /equipo).
- **Galería:** nueva categoría "Eventos" y fotos nuevas de la casa y de las uñas.
- **Contacto:** foto de la puerta de la casa.
- **Imagen para compartir** (`public/og-image.jpg`): la fachada con "Tu pausa te espera". Es la que aparece al mandar el link por WhatsApp.
- **SEO local:**
  - Títulos tipo "Salón de belleza en San Miguel, Santiago" y "Manicure & Pedicure en San Miguel".
  - Cada página trae en su HTML el título, el texto, los **servicios con precios**, la dirección y el horario, para que Google los lea sin ejecutar JavaScript.
  - Datos estructurados `BeautySalon` (dirección, horario, mapa, comunas cercanas) y `FAQPage`.
  - Sitemap actualizado.

---

## 3. Google Business Profile (Perfil de Empresa)

Es lo que más pesa para salir arriba cuando alguien busca "salón de belleza San Miguel" o "uñas cerca de mí". Entra en https://business.google.com con la cuenta dueña del perfil.

### 3.1 Datos básicos (deben ser idénticos a la web)
- **Nombre:** `Naamá Studio`. Sin agregar "salón de belleza San Miguel" al nombre, porque Google lo considera spam y puede suspender el perfil.
- **Categoría principal:** Salón de belleza.
- **Categorías secundarias:** Peluquería · Salón de manicura y pedicura · Centro de estética · Servicio de maquillaje · Salón de depilación · Podólogo (solo si siguen ofreciendo podología).
- **Dirección:** Arcadia 1297, San Miguel, Región Metropolitana. Revisa que el pin del mapa quede exactamente sobre la puerta.
- **Horario:** lunes a sábado de 10:30 a 19:30, domingo cerrado. Agrega los feriados como horario especial cada vez.
- **Teléfono:** +56 9 7952 0623.
- **Sitio web:** `https://naamastudio.cl/?utm_source=google&utm_medium=perfil`
- **Link de reservas / citas:** `https://naamastudio.cl/reservar?utm_source=google&utm_medium=reservas`

### 3.2 Descripción (copiar y pegar, 704 de 750 caracteres)
> Naamá Studio es un salón de belleza y bienestar en una casa patrimonial de San Miguel, Santiago. No vendemos servicios, custodiamos pausas: aquí la belleza se hace sin apuro, con técnica y un trato cercano. Hacemos corte y peinado, colorimetría (balayage, babylights y mechas), tratamientos y alisados capilares, manicure y pedicure con esmaltado permanente, soft gel y nail art, cejas, pestañas y depilación, limpiezas faciales y masajes. También preparamos a novias, madrinas y familias para matrimonios y eventos, en el salón o a domicilio, y tenemos gift cards y una pequeña boutique. Atendemos de lunes a sábado de 10:30 a 19:30 en Arcadia 1297, San Miguel. Reserva en naamastudio.cl o por WhatsApp.

### 3.3 Servicios
En "Editar servicios", agrega los mismos nombres y precios de la web: Corte de dama, Balayage, Babylights, Alisado brasileño, Esmaltado permanente, Soft gel, Polygel, Pedicure, Diseño de cejas, Lifting de pestañas, Depilación con cera, Limpieza facial, Masaje de relajación, Maquillaje social, Peinado para eventos y Podología.
Ponle una descripción corta a cada uno. Los nombres de servicio también cuentan para aparecer en búsquedas como "balayage San Miguel".

### 3.4 Atributos
Activa los que sean verdad: "Citas obligatorias / Acepta reservas", "Se identifica como empresa liderada por mujeres", formas de pago (tarjeta de débito y crédito, si aplica), "Wi-Fi", "Baño", y accesibilidad solo si de verdad hay acceso sin escalones.

### 3.5 Fotos (lo que más mueve las visitas al perfil)
- **Logo:** el logo Naamá sobre fondo crema.
- **Portada:** la fachada terracota (`photos-src/casa-fachada.jpg`).
- **Interior:** sala de espera, recepción, estaciones y tocador.
- **Trabajos:** 3 a 5 fotos nuevas cada semana (uñas, color, peinados, eventos). Que las suba el equipo desde el celular del salón.
- **Equipo:** solo en la sección "Equipo" del perfil, nunca como portada.
- Nunca fotos de stock ni de IA.

### 3.6 Reseñas (el factor número 1 en búsquedas locales)
- Meta: **10 reseñas nuevas al mes.**
- Imprime un QR con el link "Pedir reseñas" (Perfil → Pedir reseñas) y déjalo en recepción y en el mesón.
- Al pagar, la persona que atiende dice: *"¿Te puedo pedir un favor? Si te gustó, una reseña en Google nos ayuda muchísimo"* y manda el link por WhatsApp.
- **Responde todas las reseñas en menos de 48 horas**, nombrando el servicio. Por ejemplo: *"¡Gracias, Francisca! Nos alegra que tu balayage haya quedado como lo soñabas. Te esperamos en tu próxima pausa en San Miguel 🤍"*.
- Ante una reseña negativa, responde con calma, sin discutir, y ofrece solucionarlo por WhatsApp.

### 3.7 Novedades (publicaciones)
Publica una vez por semana: usa la misma foto del post de Instagram y agrega el botón "Reservar". Algunas ideas son temporada de matrimonios y licenciaturas, gift cards de Navidad y un trabajo destacado de la semana.

### 3.8 Preguntas y respuestas
Agrega las mismas preguntas frecuentes de la web (`src/data/faq.js`) en la sección de preguntas del perfil, respondidas por ustedes.

---

## 4. Google Search Console (que Google conozca la web nueva)
1. Entra a https://search.google.com/search-console y agrega la propiedad de dominio `naamastudio.cl`. Te pide verificar con un registro TXT en Cloudflare: DNS → Agregar registro → TXT.
2. Ve a Sitemaps → envía `https://naamastudio.cl/sitemap.xml`.
3. Usa Inspección de URL → `https://naamastudio.cl/` → **Solicitar indexación**. Repite con `/servicios` y `/contacto`.
4. Una vez al mes, revisa en Rendimiento con qué búsquedas apareces ("salón de belleza san miguel", "manicure san miguel", etc.).

## 5. Otros directorios (mismos datos exactos en todos)
- **Apple Business Connect** (https://businessconnect.apple.com): para aparecer en Mapas del iPhone.
- **Bing Places** (https://www.bingplaces.com): se puede importar directo desde Google.
- **Instagram:** usa la misma dirección y el mismo horario en el botón de contacto, con el link a `naamastudio.cl`.
- **Waze:** que el pin quede en Arcadia 1297.

El nombre, la dirección y el teléfono deben estar escritos **igual** en todas partes.

## 6. Rutina mensual (30 minutos)
- [ ] Subir 12 o más fotos nuevas al perfil de Google.
- [ ] Publicar 4 novedades.
- [ ] Responder todas las reseñas.
- [ ] Revisar en Search Console con qué búsquedas apareces.
- [ ] Revisar precios y horario en la web y en Google, y actualizar si cambiaron.
