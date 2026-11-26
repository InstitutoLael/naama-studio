// Franja de foto y palabra girada de cada grupo de la carta (P02).
const SECCIONES = {
  Cortes: ['Cortes', 'cabello-castano'],
  Color: ['Color', 'cabello-brillo'],
  'Balayage, mechas y babylights': ['Mechas', 'cabello-balayage'],
  'Alisado y botox': ['Alisado', 'cabello-rubio'],
  'Brushing y peinados': ['Peinado', 'evento-ondas'],
  Maquillaje: ['Maquillaje', 'evento-maquillaje'],
  Lavados: ['Lavado', 'cabello-ondas'],
  'Tratamientos por línea': ['Brillo', 'cabello-brillo'],
  'Cuero cabelludo y extras': ['Raíz', 'salon-estaciones'],
  'Promos manos + pies': ['Promo', 'unas-glitter'],
  Manos: ['Manos', 'unas-burdeo-oro'],
  Extensiones: ['Uñas', 'unas-cat-eye'],
  Pies: ['Pies', 'unas-chocolate'],
  'Diseños y retiros': ['Diseño', 'unas-serpiente'],
  'Spa de manos y pies': ['Spa', 'unas-burdeo-floral'],
  Cejas: ['Cejas', 'salon-tocador'],
  Pestañas: ['Pestañas', 'evento-jardin'],
  'Depilación · rostro': ['Rostro', 'evento-maquillaje'],
  'Depilación · cuerpo': ['Cuerpo', 'salon-rincon'],
  'Depilación · zona íntima': ['Íntima', 'casa-puerta'],
  'Depilación · hombre': ['Hombre', 'salon-recepcion'],
  Masajes: ['Masaje', 'salon-rincon'],
  'Drenaje y reductivos': ['Drenaje', 'casa-sala'],
  'Limpiezas faciales': ['Facial', 'salon-tocador'],
  'Estética facial': ['Piel', 'evento-jardin'],
  Podología: ['Pies', 'salon-estaciones'],
};

export const franjaDe = (titulo, mundo) => {
  const f = SECCIONES[titulo];
  if (f) return { palabra: f[0], foto: f[1] };
  return { palabra: (titulo || mundo?.short || '').split(/[ ,·]/)[0], foto: mundo?.photo ?? 'casa-sala' };
};
