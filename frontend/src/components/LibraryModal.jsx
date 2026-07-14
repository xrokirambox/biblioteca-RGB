import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Library,
  BookOpen,
  ExternalLink,
  Save,
  Check,
  Trash2,
  Folder,
  FileText,
  Link2,
  GraduationCap,
  Sprout,
  BookOpenText,
  Sigma,
  Leaf,
  Globe2,
  Languages,
  Palette,
  Dumbbell,
  HeartHandshake,
  FlaskConical,
  Atom,
  TestTube2,
  ScrollText,
  Map,
  Cpu,
  Brain,
  LineChart,
  Layers,
  Network,
  Shield,
  School,
  Award,
  Star,
  Bookmark,
  BookMarked,
  BookX,
  BookCheck,
  PenTool,
  Ruler,
  Calculator,
  Compass,
  Music,
  Monitor,
  Code,
  Database,
  Grid2x2 as Grid,
  LayoutGrid as Layout,
  List,
  SquareCheck as CheckSquare,
  Clipboard,
  FileCode,
  Hash,
  Binary,
  Users,
  User,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  MessageCircle,
  MessageSquare,
  Bell,
  Search,
  ListFilter as Filter,
  ChartBar as BarChart,
  ChartPie as PieChart,
  TrendingUp,
  Activity,
  Heart,
  ThumbsUp,
  Eye,
  Printer,
  Download,
  Upload,
  Paperclip,
  Tag,
  Tags,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Crown,
  Trophy,
  Medal,
  Gift,
  ShoppingCart,
  Wallet,
  CreditCard,
  Receipt,
  Package,
  Box,
  Archive,
  Trash,
  RefreshCw,
  RotateCcw,
  Undo,
  Redo,
  Scissors,
  Copy,
  ClipboardList,
  ClipboardCheck,
  FilePlus,
  FileMinus,
  File as FileEdit,
  LogIn,
  LogOut,
  Settings,
  FileSliders as Sliders,
  ToggleLeft,
  ToggleRight,
  Wifi,
  Bluetooth,
  Cast,
  Airplay,
  Radio,
  Tv,
  MonitorPlay,
  Film,
  Video,
  Camera,
  Image,
  Images,
  Aperture,
  Focus,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  Type,
  Quote,
  Terminal,
  Bug,
  Home,
  Building,
  Building2,
  Warehouse,
  Landmark,
  TreePine,
  Flower,
  Mountain,
  Umbrella,
  Snowflake,
  Flame,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlusCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  Rewind,
  FastForward,
  Repeat,
  Shuffle,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Watch,
  Clock,
  AlarmClock,
  Timer,
  Hourglass,
  Calendar,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarClock,
  Pin,
  PinOff,
  MapPinned,
  Locate,
  Crosshair,
  Target,
  Radar,
  Scan,
  ScanLine,
  ScanFace,
  ScanEye,
  ScanSearch,
  ScanText,
  Barcode,
  QrCode,
  Ticket,
  TicketCheck,
  KeyRound as Key,
  UnlockKeyhole as Unlock,
  LockKeyhole as Lock,
} from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const ALL_ICONS = {
  BookOpen,
  BookOpenText,
  GraduationCap,
  Sprout,
  Folder,
  FileText,
  Link2,
  Sigma,
  FlaskConical,
  Atom,
  TestTube2,
  Globe2,
  Languages,
  Palette,
  Dumbbell,
  HeartHandshake,
  ScrollText,
  Map,
  Cpu,
  Brain,
  LineChart,
  Layers,
  Network,
  Shield,
  School,
  Award,
  Star,
  Bookmark,
  BookMarked,
  BookX,
  BookCheck,
  PenTool,
  Ruler,
  Calculator,
  Compass,
  Music,
  Monitor,
  Code,
  Database,
  Grid,
  Layout,
  List,
  CheckSquare,
  Clipboard,
  FileCode,
  Hash,
  Binary,
  Lock,
  Key,
  Unlock,
  Users,
  User,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  MessageCircle,
  MessageSquare,
  Bell,
  Search,
  Filter,
  BarChart,
  PieChart,
  TrendingUp,
  Activity,
  Heart,
  ThumbsUp,
  Eye,
  Printer,
  Download,
  Upload,
  Paperclip,
  Tag,
  Tags,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Crown,
  Trophy,
  Medal,
  Gift,
  ShoppingCart,
  Wallet,
  CreditCard,
  Receipt,
  Package,
  Box,
  Archive,
  Trash,
  RefreshCw,
  RotateCcw,
  Undo,
  Redo,
  Scissors,
  Copy,
  ClipboardList,
  ClipboardCheck,
  FilePlus,
  FileMinus,
  FileEdit,
  ExternalLink,
  LogIn,
  LogOut,
  Settings,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Wifi,
  Bluetooth,
  Cast,
  Airplay,
  Radio,
  Tv,
  MonitorPlay,
  Film,
  Video,
  Camera,
  Image,
  Images,
  Aperture,
  Focus,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  Type,
  Quote,
  Terminal,
  Bug,
  Home,
  Building,
  Building2,
  Warehouse,
  Landmark,
  TreePine,
  Flower,
  Mountain,
  Umbrella,
  Snowflake,
  Flame,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlusCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  Rewind,
  FastForward,
  Repeat,
  Shuffle,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Watch,
  Clock,
  AlarmClock,
  Timer,
  Hourglass,
  Calendar,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarClock,
  Pin,
  PinOff,
  MapPinned,
  Locate,
  Crosshair,
  Target,
  Radar,
  Scan,
  ScanLine,
  ScanFace,
  ScanEye,
  ScanSearch,
  ScanText,
  Barcode,
  QrCode,
  Ticket,
  TicketCheck,
};

function getIcon(name) {
  return ALL_ICONS[name] || BookOpen;
}

const Breadcrumb = ({ category, subcategory }) => {
  const label = subcategory
    ? `Biblioteca · ${category?.name || "..."} · ${subcategory.name}`
    : category
      ? `Biblioteca · ${category.name}`
      : "Biblioteca · Materias Generales";

  return (
    <div className="flex items-center gap-2 font-dm-sans text-xs sm:text-sm tracking-wide" data-testid="modal-breadcrumb">
      <Library className="w-4 h-4 text-[#c9a227]" />
      <span className="text-[#c9a227]">{label}</span>
    </div>
  );
};

const CategoryView = ({ category, onSelectSub }) => {
  const Icon = getIcon(category.icon);
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#c9a227]" />
          </div>
          <div>
            <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1]">{category.name}</h3>
            <p className="font-cormorant text-sm text-[#a3b3a6] max-w-2xl">
              {category.description || "Selecciona un grado para ver sus materias disponibles."}
            </p>
          </div>
        </div>
        <div className="font-dm-sans text-xs uppercase tracking-[0.3em] text-[#c9a227]/80 mb-4">
          Grados disponibles
        </div>
      </div>

      {category.subcategories?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelectSub(sub.id)}
              className="group text-left glass rounded-lg p-6 border border-white/5 hover:border-[#c9a227]/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-dm-sans text-xs uppercase tracking-[0.25em] text-[#c9a227] mb-2">Grado</p>
                  <h4 className="font-cinzel text-xl text-[#f4f1e1]">{sub.name}</h4>
                </div>
                <span className="text-[#c9a227]/70">{(sub.materias?.length || 0)} materias</span>
              </div>
              <p className="font-cormorant text-sm text-[#a3b3a6] line-clamp-3">
                {sub.description || "Explora los recursos asociados a este grado."}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 font-cormorant text-lg text-[#a3b3a6]">
          No hay grados configurados para esta categoría.
        </div>
      )}
    </div>
  );
};

const SubcategoryView = ({ category, subcategory }) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#c9a227]" />
          </div>
          <div>
            <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1]">{subcategory.name}</h3>
            <p className="font-cormorant text-sm text-[#a3b3a6] max-w-2xl">
              {subcategory.description || `Materias disponibles para ${subcategory.name}.`}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#c9a227]/80">
              {category.name}
            </p>
          </div>
        </div>
      </div>

      {subcategory.materias?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {subcategory.materias.map((materia) => (
            <MateriaCard key={materia.id} materia={materia} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 font-cormorant text-lg text-[#a3b3a6]">
          Esta subcategoría aún no tiene materias.
        </div>
      )}
    </div>
  );
};

/**
 * Aplana el árbol jerárquico (nivel -> grado -> materias) en una lista
 * única de materias generales, deduplicadas por nombre normalizado, para
 * mostrarlas todas juntas sin pasos intermedios de navegación.
 */
function flattenMaterias(hierarchyTree) {
  const seen = new Map();
  (hierarchyTree || []).forEach((nivel) => {
    (nivel.subcategories || []).forEach((grado) => {
      (grado.materias || []).forEach((materia) => {
        const key = (materia.name || "").trim().toLowerCase();
        if (!key) return;
        if (!seen.has(key)) {
          seen.set(key, materia);
        } else {
          // Si ya existe una materia con este nombre pero sin url, y la
          // nueva sí tiene url, nos quedamos con la que tiene recurso.
          const existing = seen.get(key);
          if (!existing.url && materia.url) seen.set(key, materia);
        }
      });
    });
  });
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

const normalized = (value = "") => value.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");

const MateriaCard = ({ materia }) => {
  const { updateHierarchyMateria, books } = useLibrary();
  const { isStaff } = useAuth();
  const [url, setUrl] = useState(materia.url || "");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const Icon = getIcon(materia.icon);

  useEffect(() => { setUrl(materia.url || ""); }, [materia.url]);

  // Buscamos un libro relacionado para usar su portada y descripción como
  // "portada" y "breve descripción" de la materia. Si la materia trae sus
  // propios campos cover/description, esos tienen prioridad.
  const relatedBook = useMemo(() => {
    const target = normalized(materia.name);
    return (books || []).find((book) => {
      const category = normalized(book.category || "");
      const title = normalized(book.title || "");
      return category === target || title.includes(target) || category.includes(target);
    });
  }, [books, materia.name]);

  const cover = materia.cover || relatedBook?.cover || null;
  const description =
    materia.description ||
    relatedBook?.description ||
    "Recursos y material de apoyo para esta materia.";

  const isValid = url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
  const canGo = !!materia.url;

  const handleSave = async () => {
    if (!isValid) return toast.error("Ingresa una URL válida (http, https o /).");
    try {
      setSaving(true);
      await updateHierarchyMateria(materia.id, { url });
      toast.success(`Enlace guardado para ${materia.name}`);
      setEditing(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      await updateHierarchyMateria(materia.id, { url: "" });
      setUrl("");
      toast.success("Enlace eliminado");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div
      data-testid={`materia-card-${materia.id}`}
      className="group glass rounded-lg overflow-hidden border border-white/5 hover:border-[#c9a227]/40 transition-all flex flex-col"
    >
      {/* Portada pequeña */}
      <div className="relative h-28 w-full bg-[#020b04] border-b border-white/5 flex items-center justify-center overflow-hidden">
        {cover ? (
          <img src={cover} alt={materia.name} className="h-full w-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#c9a227]" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="font-cinzel text-base text-[#f4f1e1] mb-1 truncate">{materia.name}</div>
        <p className="font-cormorant text-sm text-[#a3b3a6] line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        {!isStaff ? (
          canGo ? (
            <a
              href={materia.url}
              target="_blank"
              rel="noreferrer"
              data-testid={`materia-go-${materia.id}`}
              className="bg-[#c9a227] text-[#020b04] hover:bg-[#b08d22] px-4 py-2 rounded-sm font-dm-sans text-xs tracking-widest uppercase inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              Ir <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span
              data-testid={`materia-empty-${materia.id}`}
              className="px-4 py-2 rounded-sm font-dm-sans text-xs tracking-widest uppercase text-[#a3b3a6]/50 border border-white/5 text-center"
            >
              No disponible
            </span>
          )
        ) : editing ? (
          <div className="flex flex-col gap-2">
            <input
              data-testid={`materia-input-${materia.id}`}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2 text-xs font-dm-sans text-white placeholder:text-[#a3b3a6]/50 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] transition"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                data-testid={`materia-save-${materia.id}`}
                className="flex-1 px-3 py-2 rounded-sm border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-[#020b04] transition-colors font-dm-sans text-[11px] tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
              >
                {saving ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                Guardar
              </button>
              {canGo && (
                <button
                  onClick={handleRemove}
                  data-testid={`materia-remove-${materia.id}`}
                  className="p-2 rounded-sm border border-red-900/50 text-red-400/80 hover:bg-red-950/50 transition-colors"
                  title="Eliminar enlace"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => { setEditing(false); setUrl(materia.url || ""); }}
                className="p-2 rounded-sm border border-white/10 text-[#a3b3a6] hover:bg-white/5 transition-colors"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              data-testid={`materia-edit-${materia.id}`}
              className="flex-1 px-3 py-2 rounded-sm border border-[#c9a227]/40 text-[#c9a227] hover:bg-[#c9a227]/10 transition-colors font-dm-sans text-[11px] tracking-widest uppercase"
            >
              {materia.url ? "Editar enlace" : "Añadir enlace"}
            </button>
            <a
              href={canGo ? materia.url : undefined}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { if (!canGo) e.preventDefault(); }}
              data-testid={`materia-go-${materia.id}`}
              className={`px-3 py-2 rounded-sm font-dm-sans text-[11px] tracking-widest uppercase inline-flex items-center gap-1.5 transition-colors ${
                canGo ? "bg-[#c9a227] text-[#020b04] hover:bg-[#b08d22]" : "bg-[#c9a227]/20 text-[#c9a227]/40 cursor-not-allowed"
              }`}
              aria-disabled={!canGo}
            >
              Ir <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const MateriasGeneralesView = () => {
  const { hierarchyTree } = useLibrary();
  const { isStaff } = useAuth();
  const materias = useMemo(() => flattenMaterias(hierarchyTree), [hierarchyTree]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1] mb-2">Materias Generales</h3>
        <p className="font-cormorant text-lg text-[#a3b3a6]">
          {isStaff
            ? "Gestiona el enlace de cada materia. Se muestran todas las materias configuradas en la biblioteca."
            : "Explora todas las materias disponibles con su portada y una breve descripción."}
        </p>
      </div>

      {materias.length === 0 ? (
        <div className="text-center py-12 font-cormorant text-lg text-[#a3b3a6]">
          No hay materias configuradas todavía. El staff puede crearlas desde el panel de administración.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" data-testid="materias-list">
          {materias.map((m) => (
            <MateriaCard key={m.id} materia={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export const LibraryModal = () => {
  const {
    modalOpen, closeModal, hierarchyTree, level, hierCatId, hierSubId,
    goBackHierarchy, goToHierSub,
  } = useLibrary();

  const selectedCategory = hierarchyTree.find((cat) => cat.id === hierCatId) || null;
  const selectedSubcategory = selectedCategory?.subcategories?.find((sub) => sub.id === hierSubId) || null;

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  const renderContent = () => {
    if (level === 1 && selectedCategory) {
      return <CategoryView category={selectedCategory} onSelectSub={goToHierSub} />;
    }
    if (level === 2 && selectedCategory && selectedSubcategory) {
      return <SubcategoryView category={selectedCategory} subcategory={selectedSubcategory} />;
    }
    return <MateriasGeneralesView />;
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-[#020b04]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={closeModal} data-testid="library-modal-overlay">
      <div className="w-full max-w-5xl bg-[#051a09] border border-[#c9a227]/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()} data-testid="library-modal">
        <div className="p-5 sm:p-6 border-b border-[#c9a227]/20 bg-[#020b04]/60 flex items-start gap-4">
          <div className="flex-1">
            <Breadcrumb category={selectedCategory} subcategory={selectedSubcategory} />
          </div>
          {level > 0 && (
            <button
              type="button"
              onClick={goBackHierarchy}
              className="px-4 py-2 rounded-sm border border-[#c9a227]/20 text-[#c9a227] hover:bg-[#c9a227]/10 font-dm-sans text-xs tracking-widest uppercase"
            >
              Volver
            </button>
          )}
          <button onClick={closeModal} data-testid="modal-close-btn"
            className="p-2 rounded-full hover:bg-[#c9a227]/10 text-[#c9a227] transition" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
          {renderContent()}
        </div>
      </div>
    </div>,
    document.body
  );
};