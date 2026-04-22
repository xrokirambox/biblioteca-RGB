// Academic structure: Niveles -> Grados
export const NIVELES = [
  {
    id: "primaria",
    name: "Primaria",
    subtitle: "Grados 1 a 5",
    description: "Fundamentos esenciales del aprendizaje.",
    icon: "Sprout",
    grados: [
      { id: "g1", name: "1º Primaria", short: "1º" },
      { id: "g2", name: "2º Primaria", short: "2º" },
      { id: "g3", name: "3º Primaria", short: "3º" },
      { id: "g4", name: "4º Primaria", short: "4º" },
      { id: "g5", name: "5º Primaria", short: "5º" },
    ],
  },
  {
    id: "secundaria",
    name: "Secundaria",
    subtitle: "Grados 6 a 9",
    description: "Profundización en áreas clave.",
    icon: "BookOpenText",
    grados: [
      { id: "g6", name: "6º Secundaria", short: "6º" },
      { id: "g7", name: "7º Secundaria", short: "7º" },
      { id: "g8", name: "8º Secundaria", short: "8º" },
      { id: "g9", name: "9º Secundaria", short: "9º" },
    ],
  },
  {
    id: "media",
    name: "Media",
    subtitle: "Grados 10 y 11",
    description: "Preparación para la universidad.",
    icon: "GraduationCap",
    grados: [
      { id: "g10", name: "10º Media", short: "10º" },
      { id: "g11", name: "11º Media", short: "11º" },
    ],
  },
];

export const getNivelById = (id) => NIVELES.find((n) => n.id === id);
export const getGradoById = (gradoId) => {
  for (const n of NIVELES) {
    const g = n.grados.find((x) => x.id === gradoId);
    if (g) return { ...g, nivel: n };
  }
  return null;
};
