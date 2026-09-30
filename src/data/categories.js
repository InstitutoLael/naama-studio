// "Mundos" de servicios. `categories` corresponde al campo `cat` de servicesData.
// Todas las categorías de servicesData deben estar cubiertas por algún mundo.
export const mundos = [
  {
    id: 'cabello',
    name: 'Cabello & Color',
    short: 'Cabello',
    categories: ['Peluquería', 'Adicional'],
    description: 'Cortes, balayage, babylights, alisados y peinados. Color que se ve nacido, no puesto.',
    photo: 'cabello-balayage',
  },
  {
    id: 'tratamientos',
    name: 'Tratamientos Capilares',
    short: 'Tratamientos',
    categories: ['Tratamiento Capilar'],
    description: 'Botox, hidratación y reconstrucción para devolverle fuerza y brillo a tu fibra capilar.',
    photo: 'cabello-brillo',
  },
  {
    id: 'unas',
    name: 'Manicure & Pedicure',
    short: 'Uñas',
    categories: ['Manicure', 'Pedicure'],
    description: 'Esmaltado permanente, soft gel, polygel y nail art hecho a mano, con pulcritud absoluta.',
    photo: 'unas-burdeo-oro',
  },
  {
    id: 'mirada',
    name: 'Cejas, Pestañas & Depilación',
    short: 'Mirada',
    categories: ['Pestañas y Cejas', 'Depilación'],
    description: 'Diseño de cejas, lifting de pestañas y depilación con cera, con técnica delicada.',
    photo: 'salon-tocador',
  },
  {
    id: 'bienestar',
    name: 'Faciales & Masajes',
    short: 'Bienestar',
    categories: ['Estetica', 'Masaje'],
    description: 'Limpiezas faciales, maderoterapia y masajes para descomprimir cuerpo y mente.',
    photo: 'salon-rincon',
  },
  {
    id: 'podologia',
    name: 'Podología Clínica',
    short: 'Podología',
    categories: ['Podología'],
    description: 'Atención clínica especializada para la salud y el cuidado de tus pies.',
    photo: 'salon-estaciones',
  },
];

// IDs antiguos → nuevos (para no romper enlaces ya compartidos)
export const legacyMundoIds = {
  capilar: 'cabello',
  color: 'cabello',
  'manos-pies': 'unas',
  clinico: 'podologia',
};

const splitCats = (cat = '') => cat.split(',').map((c) => c.trim());

// Los adicionales van al final de cada lista.
const isExtra = (s) => s.name.startsWith('Adicional');

export const servicesForMundo = (services, mundo) =>
  services
    .filter((s) => splitCats(s.cat).some((c) => mundo.categories.includes(c)))
    .sort((a, b) => isExtra(a) - isExtra(b));
