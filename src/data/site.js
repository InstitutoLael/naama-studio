// Datos de contacto y horarios — única fuente de verdad para todo el sitio.
export const SITE = {
  name: 'Naamá Studio',
  tagline: 'Beauty & Wellness House',
  url: 'https://naamastudio.cl',
  phoneDisplay: '+56 9 7952 0623',
  phone: '56979520623',
  email: 'naamastudiospa@gmail.com',
  instagram: 'https://www.instagram.com/naamastudio_/',
  instagramHandle: '@naamastudio_',
  address: 'Arcadia 1297, San Miguel',
  city: 'Santiago, Chile',
  // Ficha real de Google (place_id de Naamá Studio, Arcadia 1297).
  placeId: 'ChIJI6IRvk3FYpYRnMPtgSOPH68',
  lat: -33.4799562,
  lng: -70.6504214,
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Naam%C3%A1%20Studio%2C%20Arcadia%201297%2C%20San%20Miguel&query_place_id=ChIJI6IRvk3FYpYRnMPtgSOPH68',
  comoLlegarUrl: 'https://www.google.com/maps/dir/?api=1&destination=Naam%C3%A1%20Studio%2C%20Arcadia%201297%2C%20San%20Miguel&destination_place_id=ChIJI6IRvk3FYpYRnMPtgSOPH68',
  mapaEmbed: 'https://www.google.com/maps?q=Naam%C3%A1%20Studio%2C%20Arcadia%201297%2C%20San%20Miguel%2C%20Chile&z=17&output=embed',
  // Abre directo la ventana para dejar reseña en Google.
  reviewsUrl: 'https://search.google.com/local/writereview?placeid=ChIJI6IRvk3FYpYRnMPtgSOPH68',
  metro: 'A pasos del metro El Llano',
};

export const HORARIO_CORTO = 'Lun–sáb 10:30–19:30';
export const HORARIO_LARGO = 'Lunes a sábado · 10:30 a 19:30';

// day: 0 = domingo … 6 = sábado. open/close en minutos desde medianoche.
export const HOURS = [
  { label: 'Lunes a Sábado', value: '10:30 — 19:30', days: [1, 2, 3, 4, 5, 6], open: 630, close: 1170 },
  { label: 'Domingo', value: 'Cerrado', days: [0] },
];

/** Hora de Chile (no la del teléfono de quien mira). */
export const horaChile = (date = new Date()) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { dia, minutos: Number(p.hour) * 60 + Number(p.minute) };
};

export const isOpenNow = (date = new Date()) => {
  const { dia, minutos } = horaChile(date);
  const slot = HOURS.find((h) => h.days.includes(dia));
  if (!slot?.open) return false;
  return minutos >= slot.open && minutos < slot.close;
};

export const whatsappUrl = (text = 'Hola! Me gustaría saber más sobre los servicios de Naamá Studio.') =>
  `https://wa.me/${SITE.phone}?text=${encodeURIComponent(text)}`;
