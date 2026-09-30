// Equipo de especialistas. `name` debe coincidir con el campo `worker` de servicesData.
// `photo` es el nombre del retrato en src/data/photos.json (si no hay, se muestra la inicial).
export const team = [
  {
    name: 'Valeria',
    role: 'Colorista & Alisados',
    specialties: ['Balayage', 'Babylights', 'Alisado Brasileño', 'Cortes'],
    tone: '#2a1c14',
    photo: 'retrato-valeria',
  },
  {
    name: 'Viviana',
    role: 'Cabello, Faciales & Bienestar',
    specialties: ['Cortes', 'Tratamientos Capilares', 'Limpiezas Faciales', 'Masajes'],
    tone: '#7a5a43',
    photo: 'retrato-viviana',
  },
  {
    name: 'Gaby',
    role: 'Uñas, Cejas & Pestañas',
    specialties: ['Manicure', 'Pedicure', 'Lifting', 'Depilación'],
    tone: '#8e5a2b',
    photo: 'retrato-gaby',
  },
  {
    name: 'Leah',
    role: 'Manicure, Pedicure & Cabello',
    specialties: ['Esmaltado Permanente', 'Pedicure', 'Lavado & Brushing'],
    tone: '#6b2737',
    photo: 'retrato-leah',
  },
  {
    name: 'Catalina',
    role: 'Manicure, Pedicure & Cabello',
    specialties: ['Esmaltado Permanente', 'Pedicure', 'Lavado & Brushing'],
    tone: '#4e3b31',
    photo: 'retrato-catalina',
  },
  {
    name: 'Allison',
    role: 'Make-up & Peinados',
    specialties: ['Maquillaje Social', 'Peinados para Eventos'],
    tone: '#1c120c',
    photo: 'retrato-allison',
  },
  {
    name: 'Michelle',
    role: 'Podología Clínica',
    specialties: ['Podología Básica', 'Podología Avanzada'],
    tone: '#3f4a45',
  },
];

export const teamNames = team.map((t) => t.name);
