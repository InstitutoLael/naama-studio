// Equipo de especialistas. `name` debe coincidir con el campo `worker` de servicesData.
// `photo` es el nombre del retrato en src/data/photos.json (si no hay, se muestra la inicial).
// El equipo cambia con el tiempo: la identidad de la web descansa en la casa, no en esta lista.
export const team = [
  {
    name: 'Viviana',
    role: 'Cabello, Faciales & Bienestar',
    specialties: ['Cortes', 'Tratamientos Capilares', 'Limpiezas Faciales', 'Masajes'],
    tone: '#211a17',
    photo: 'retrato-viviana',
  },
  {
    name: 'Valeria',
    role: 'Colorista & Alisados',
    specialties: ['Balayage', 'Babylights', 'Alisado Brasileño', 'Cortes'],
    tone: '#33271f',
    photo: 'retrato-valeria',
  },
  {
    name: 'Gaby',
    role: 'Uñas, Cejas & Pestañas',
    specialties: ['Manicure', 'Pedicure', 'Lifting', 'Depilación'],
    tone: '#8c4a36',
    photo: 'retrato-gaby',
  },
  {
    name: 'Katalina',
    role: 'Manicure, Pedicure & Cabello',
    specialties: ['Esmaltado Permanente', 'Nail Art', 'Pedicure', 'Lavado & Brushing'],
    tone: '#a65d45',
    photo: 'retrato-katalina',
  },
  {
    name: 'Allison',
    role: 'Make-up & Peinados',
    specialties: ['Maquillaje Social', 'Peinados para Eventos'],
    tone: '#4f443d',
    photo: 'retrato-allison',
  },
];

export const teamNames = team.map((t) => t.name);
