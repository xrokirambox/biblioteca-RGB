// Materias (subjects) organized per grade id.
// Each materia: { id, name, icon (lucide-react icon name), color }

const BASE_PRIMARIA = [
  { id: "mat", name: "Matemáticas", icon: "Sigma" },
  { id: "esp", name: "Español", icon: "BookOpen" },
  { id: "cie", name: "Ciencias Naturales", icon: "Leaf" },
  { id: "soc", name: "Ciencias Sociales", icon: "Globe2" },
  { id: "ing", name: "Inglés", icon: "Languages" },
  { id: "art", name: "Artística", icon: "Palette" },
  { id: "edf", name: "Educación Física", icon: "Dumbbell" },
  { id: "eti", name: "Ética y Valores", icon: "HeartHandshake" },
];

const BASE_SECUNDARIA = [
  { id: "mat", name: "Matemáticas", icon: "Sigma" },
  { id: "esp", name: "Lengua Castellana", icon: "BookOpen" },
  { id: "bio", name: "Biología", icon: "FlaskConical" },
  { id: "fis", name: "Física", icon: "Atom" },
  { id: "qui", name: "Química", icon: "TestTube2" },
  { id: "soc", name: "Ciencias Sociales", icon: "Globe2" },
  { id: "his", name: "Historia", icon: "ScrollText" },
  { id: "geo", name: "Geografía", icon: "Map" },
  { id: "ing", name: "Inglés", icon: "Languages" },
  { id: "tec", name: "Tecnología", icon: "Cpu" },
  { id: "art", name: "Artística", icon: "Palette" },
  { id: "edf", name: "Educación Física", icon: "Dumbbell" },
];

const BASE_MEDIA = [
  { id: "mat", name: "Matemáticas", icon: "Sigma" },
  { id: "cal", name: "Cálculo", icon: "FunctionSquare" },
  { id: "esp", name: "Lengua y Literatura", icon: "BookOpen" },
  { id: "fis", name: "Física", icon: "Atom" },
  { id: "qui", name: "Química", icon: "TestTube2" },
  { id: "bio", name: "Biología", icon: "FlaskConical" },
  { id: "fil", name: "Filosofía", icon: "Brain" },
  { id: "eco", name: "Economía", icon: "LineChart" },
  { id: "his", name: "Historia", icon: "ScrollText" },
  { id: "ing", name: "Inglés", icon: "Languages" },
  { id: "tec", name: "Tecnología e Informática", icon: "Cpu" },
  { id: "edf", name: "Educación Física", icon: "Dumbbell" },
];

export const MATERIAS = {
  g1: BASE_PRIMARIA,
  g2: BASE_PRIMARIA,
  g3: BASE_PRIMARIA,
  g4: BASE_PRIMARIA,
  g5: BASE_PRIMARIA,
  g6: BASE_SECUNDARIA,
  g7: BASE_SECUNDARIA,
  g8: BASE_SECUNDARIA,
  g9: BASE_SECUNDARIA,
  g10: BASE_MEDIA,
  g11: BASE_MEDIA,
};

export const CATEGORIAS = [
  { id: "all", name: "Todas" },
  { id: "literatura", name: "Literatura" },
  { id: "ciencias", name: "Ciencias" },
  { id: "matematicas", name: "Matemáticas" },
  { id: "historia", name: "Historia" },
  { id: "filosofia", name: "Filosofía" },
];
