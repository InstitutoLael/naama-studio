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
  mapsUrl: 'https://maps.google.com/maps?q=Arcadia+1297+San+Miguel+Santiago',
  reviewsUrl: 'https://share.google/ejzCWM9jJxfZLy9JJ',
};

// day: 0 = domingo … 6 = sábado. open/close en minutos desde medianoche.
export const HOURS = [
  { label: 'Lunes a Viernes', value: '09:00 — 19:00', days: [1, 2, 3, 4, 5], open: 540, close: 1140 },
  { label: 'Sábado', value: '09:00 — 17:00', days: [6], open: 540, close: 1020 },
  { label: 'Domingo', value: 'Cerrado', days: [0] },
];

export const isOpenNow = (date = new Date()) => {
  const slot = HOURS.find((h) => h.days.includes(date.getDay()));
  if (!slot?.open) return false;
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= slot.open && minutes < slot.close;
};

export const whatsappUrl = (text = 'Hola! Me gustaría saber más sobre los servicios de Naamá Studio.') =>
  `https://wa.me/${SITE.phone}?text=${encodeURIComponent(text)}`;
