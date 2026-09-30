// Equipo de especialistas. `name` debe coincidir con el campo `worker` de servicesData.
export const team = [
  {
    name: 'Valeria',
    role: 'Colorista & Alisados',
    specialties: ['Balayage', 'Babylights', 'Alisado Brasileño', 'Cortes'],
    tone: '#2C3629',
  },
  {
    name: 'Vivy',
    role: 'Faciales & Bienestar',
    specialties: ['Limpiezas Faciales', 'Masajes', 'Maderoterapia'],
    tone: '#7A5A43',
  },
  {
    name: 'Gaby',
    role: 'Uñas, Cejas & Pestañas',
    specialties: ['Manicure', 'Pedicure', 'Lifting', 'Depilación'],
    tone: '#A67C52',
  },
  {
    name: 'Leah',
    role: 'Manicurista',
    specialties: ['Esmaltado Permanente', 'Soft Gel', 'Nail Art'],
    tone: '#6B2737',
  },
  {
    name: 'Catalina',
    role: 'Manicurista',
    specialties: ['Esmaltado Permanente', 'PolyGel', 'Diseño a Mano Alzada'],
    tone: '#4E3B31',
  },
  {
    name: 'Allison',
    role: 'Make-up & Peinados',
    specialties: ['Maquillaje Social', 'Peinados para Eventos'],
    tone: '#1F261C',
  },
  {
    name: 'Michelle',
    role: 'Podología Clínica',
    specialties: ['Podología Básica', 'Podología Avanzada'],
    tone: '#3F4A45',
  },
];

export const teamNames = team.map((t) => t.name);
