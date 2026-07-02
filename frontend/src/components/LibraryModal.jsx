import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Library, BookOpen, ExternalLink, Save, Check, Trash2, Loader as Loader2, Folder, FileText, Link2, GraduationCap, Sprout, BookOpenText, Sigma, Leaf, Globe as Globe2, Languages, Palette, Dumbbell, HeartHandshake, FlaskConical, Atom, TestTube as TestTube2, ScrollText, Map, Cpu, SquareFunction as FunctionSquare, Brain, ChartLine as LineChart, Layers, Network, School, Award, Star, Bookmark, BookMarked, BookX, BookCheck, PenTool, Ruler, Calculator, Compass, Music, Monitor, Code, Database, Grid2x2 as Grid, LayoutGrid as Layout, List, SquareCheck as CheckSquare, Clipboard, FileCode, Hash, Binary, GitBranch, GitCommitVertical as GitCommit, GitMerge, GitPullRequest, GitFork as Github, Rabbit as Gitlab, Monitor as Chrome, Globe, Hop as Home, Building, Building2, Warehouse, Landmark, TreePine, Flower, Mountain, Umbrella, Snowflake, Flame, TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info, Circle as HelpCircle, CircleCheck as CheckCircle, Circle as XCircle, CircleMinus as MinusCircle, CirclePlus as PlusCircle, CirclePlay as PlayCircle, CirclePause as PauseCircle, CircleStop as StopCircle, SkipForward, SkipBack, Rewind, FastForward, Repeat, Shuffle, Volume, Volume1, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Watch, Clock, AlarmClock, Timer, Hourglass, Calendar, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, CalendarClock, Pin, PinOff, MapPinned, Locate, Crosshair, Target, Radar, Scan, ScanLine, ScanFace, ScanEye, ScanSearch, ScanText, Barcode, QrCode, Ticket, TicketCheck, Users, User, UserCheck, UserPlus, Mail, Phone, MessageCircle, MessageSquare, Bell, Search, ListFilter as Filter, ChartBar as BarChart, ChartPie as PieChart, TrendingUp, Activity, Heart, ThumbsUp, Eye, Printer, Download, Upload, Paperclip, Tag, Tags, Circle, Square, Triangle, Hexagon, Octagon, Diamond, Crown, Trophy, Medal, Gift, ShoppingCart, Wallet, CreditCard, Receipt, Package, Box, Archive, Trash, RefreshCw, RotateCcw, Undo, Redo, Scissors, Copy, ClipboardList, ClipboardCheck, FilePlus, FileMinus, File as FileEdit, LogIn, LogOut, Settings, FileSliders as Sliders, ToggleLeft, ToggleRight, Wifi, Bluetooth, Cast, Airplay, Radio, Tv, MonitorPlay, Film, Video, Camera, Image, Images, Aperture, Focus, ZoomIn, ZoomOut, Maximize, Minimize, Move, Bold, Italic, Underline, Strikethrough, Heading, Type, Quote, Terminal, Bug, Castle, Church, Hospital, Hotel, Store, CircleDivide as DivideCircle } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const ALL_ICONS = {
  ArrowUpRight, BookOpen, BookOpenText, GraduationCap, Sprout, Folder,
  FileText, Link2, Sigma, FlaskConical, Atom, TestTube2,
  Globe2, Languages, Palette, Dumbbell, HeartHandshake,
  ScrollText, Map, Cpu, FunctionSquare, Brain, LineChart,
  Leaf, Library, School, Award, Star, Bookmark, BookMarked,
  BookX, BookCheck, PenTool, Ruler, Calculator, Compass,
  Music, Monitor, Code, Database, Layers, Grid,
  Layout, List, CheckSquare, Clipboard, FileCode, Hash, Binary,
  Network, Shield, Lock, Key, Unlock, Zap,
  Sun, Moon, Cloud, Wind, Droplets, Thermometer, Microscope,
  Telescope, Satellite, Rocket, Plane, Car, Train, Truck,
  Ship, Anchor, Flag, MapPin, Navigation, Globe,
  Users, User, UserCheck, UserPlus, Mail, Phone, MessageCircle,
  MessageSquare, Bell, Search, Filter, BarChart,
  PieChart, TrendingUp, Activity, Heart, ThumbsUp, Eye,
  Printer, Download, Upload, Paperclip, Tag, Tags, Circle,
  Square, Triangle, Hexagon, Octagon, Diamond, Crown,
  Trophy, Medal, Gift, ShoppingCart, Wallet, CreditCard,
  Receipt, Package, Box, Archive, Trash,
  RefreshCw, RotateCcw, Undo, Redo, Scissors, Copy,
  ClipboardList, ClipboardCheck, FilePlus, FileMinus, FileEdit,
  ExternalLink, LogIn, LogOut, Settings, Sliders, ToggleLeft,
  ToggleRight, Wifi, Bluetooth, Cast, Airplay, Radio,
  Tv, MonitorPlay, Film, Video, Camera, Image, Images,
  Aperture, Focus, ZoomIn, ZoomOut, Maximize, Minimize,
  Move, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, Heading, Type,
  Quote, Terminal, Bug, GitBranch, GitCommit,
  GitMerge, GitPullRequest, Github, Gitlab, Chrome, Globe,
  Home, Building, Building2, Warehouse, Landmark,
  Castle, Church, Hospital, Hotel, Store, DivideCircle,
  TreePine, Flower, Mountain, Umbrella, Snowflake, Flame,
  FireExtinguisher, Siren, AlertTriangle, AlertCircle, Info,
  HelpCircle, CheckCircle, XCircle, MinusCircle, PlusCircle,
  PlayCircle, PauseCircle, StopCircle, SkipForward, SkipBack,
  Rewind, FastForward, Repeat, Shuffle, Volume, Volume1,
  Volume2, VolumeX, Mic, MicOff, Headphones, Speaker,
  Watch, Clock, AlarmClock, Timer, Hourglass, Calendar,
  CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, CalendarClock,
  Pin, PinOff, MapPinned, Locate, Crosshair, Target,
  Radar, Scan, ScanLine, ScanFace, ScanEye, ScanSearch,
  Fingerprint, ScanText, Barcode, QrCode, Ticket, TicketCheck,
};

function getIcon(name) {
  return ALL_ICONS[name] || BookOpen;
}

const Breadcrumb = () => {
  const { level, hierCatId, goBackHierarchy, hierarchyTree } = useLibrary();
  const category = hierCatId ? hierarchyTree.find((c) => c.id === hierCatId) : null;

  return (
    <div className="flex items-center gap-2 font-dm-sans text-xs sm:text-sm tracking-wide" data-testid="modal-breadcrumb">
      <Library className="w-4 h-4 text-[#c9a227]" />
      <span className="text-[#a3b3a6]">Biblioteca</span>
      {category && (<>
        <ChevronRight className="w-3.5 h-3.5 text-[#c9a227]/60" />
        <span className={level === 1 ? "text-[#c9a227]" : "text-[#a3b3a6]"}>{category.name}</span>
      </>)}
      {level > 0 && (
        <button onClick={goBackHierarchy} data-testid="modal-back-btn"
          className="ml-auto inline-flex items-center gap-1 text-[#c9a227] hover:text-[#f4f1e1] transition">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </button>
      )}
    </div>
  );
};

const CategoryView = () => {
  const { hierarchyTree, goToHierCat } = useLibrary();

  return (
    <div className="animate-fade-in">
      <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1] mb-2">Selecciona un nivel</h3>
      <p className="font-cormorant text-lg text-[#a3b3a6] mb-8">Elige el nivel académico para explorar sus grados.</p>
      {hierarchyTree.length === 0 ? (
        <div className="text-center py-12 font-cormorant text-lg text-[#a3b3a6]">
          No hay niveles configurados. El staff puede crear la jerarquía desde el panel de administración.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {hierarchyTree.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <button key={category.id} onClick={() => goToHierCat(category.id)} data-testid={`modal-nivel-${category.id}`}
                className="group text-left glass rounded-lg p-6 hover:border-[#c9a227]/50 hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-full bg-[#c9a227]/10 flex items-center justify-center border border-[#c9a227]/30 mb-4">
                  <Icon className="w-5 h-5 text-[#c9a227]" />
                </div>
                <div className="font-cinzel text-xl text-[#f4f1e1] mb-1">{category.name}</div>
                <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#c9a227] mb-3">
                  {category.subcategories?.length || 0} grados
                </div>
                <div className="font-cormorant text-base text-[#a3b3a6]">
                  {category.description || "Explora los grados disponibles."}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SubcategoryView = () => {
  const { hierCatId, goToHierSub, hierarchyTree } = useLibrary();
  const category = hierarchyTree.find((c) => c.id === hierCatId);
  if (!category) return null;

  return (
    <div className="animate-fade-in">
      <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1] mb-2">{category.name}</h3>
      <p className="font-cormorant text-lg text-[#a3b3a6] mb-8">Selecciona un grado para ver sus materias.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {(category.subcategories || []).map((sub) => {
          const Icon = getIcon(sub.icon);
          const savedCount = sub.materias?.filter((m) => m.url)?.length || 0;
          return (
            <button key={sub.id} onClick={() => goToHierSub(sub.id)} data-testid={`modal-grado-${sub.id}`}
              className="group glass rounded-lg p-5 hover:border-[#c9a227]/50 hover:-translate-y-1 transition-all text-left">
              <div className="flex items-baseline justify-between mb-3">
                <div className="font-cinzel text-3xl text-[#c9a227]">{sub.name.slice(0, 3)}</div>
                {savedCount > 0 && (
                  <div className="px-2 py-0.5 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/30 text-[#c9a227] font-dm-sans text-[10px] tracking-wider">
                    {savedCount}
                  </div>
                )}
              </div>
              <div className="font-dm-sans text-xs tracking-widest uppercase text-[#a3b3a6]">{sub.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MateriaItem = ({ materia }) => {
  const { updateHierarchyMateria, books } = useLibrary();
  const { isStaff } = useAuth();
  const [url, setUrl] = useState(materia.url || "");
  const [saving, setSaving] = useState(false);
  const Icon = getIcon(materia.icon);

  useEffect(() => { setUrl(materia.url || ""); }, [materia.url]);

  const normalized = (value = "") => value.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
  const relatedBooks = useMemo(() => {
    const target = normalized(materia.name);
    return (books || []).filter((book) => {
      const category = normalized(book.category || "");
      const title = normalized(book.title || "");
      return category === target || title.includes(target) || category.includes(target);
    }).slice(0, 2);
  }, [books, materia.name]);

  const isValid = url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
  const canGo = !!materia.url;

  const handleSave = async () => {
    if (!isValid) return toast.error("Ingresa una URL válida (http, https o /).");
    try {
      setSaving(true);
      await updateHierarchyMateria(materia.id, { url });
      toast.success(`Enlace guardado para ${materia.name}`);
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

  // Public view
  if (!isStaff) {
    return (
      <div data-testid={`materia-item-${materia.id}`}
        className={`p-4 rounded-lg bg-white/[0.02] border border-white/5 ${canGo ? "hover:border-[#c9a227]/40" : ""} transition-colors`}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/25 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#c9a227]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-cinzel text-base text-[#f4f1e1] truncate">{materia.name}</div>
            <div className="font-dm-sans text-[10px] tracking-widest uppercase text-[#a3b3a6]">
              {canGo ? "Recurso disponible" : "Sin recurso aún"}
            </div>
          </div>
          {canGo ? (
            <a href={materia.url} target="_blank" rel="noreferrer" data-testid={`materia-go-${materia.id}`}
              className="bg-[#c9a227] text-[#020b04] hover:bg-[#b08d22] px-4 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase inline-flex items-center gap-1.5 transition-colors">
              Ir <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span data-testid={`materia-empty-${materia.id}`}
              className="px-4 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase text-[#a3b3a6]/50 border border-white/5">
              No disponible
            </span>
          )}
        </div>
        {relatedBooks.length > 0 ? (
          <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
            {relatedBooks.map((book) => (
              <a key={book.id} href={book.url} target="_blank" rel="noreferrer"
                className="flex items-start gap-3 rounded-md bg-black/20 p-2 hover:bg-[#c9a227]/10 transition-colors">
                <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded-sm border border-[#c9a227]/20 bg-[#020b04]">
                  {book.cover ? <img src={book.cover} alt={book.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-[#c9a227]/40"><BookOpen className="w-4 h-4" /></div>}
                </div>
                <div className="min-w-0">
                  <div className="font-dm-sans text-xs text-[#f4f1e1] line-clamp-1">{book.title}</div>
                  <div className="font-cormorant text-xs text-[#a3b3a6] line-clamp-2 mt-0.5">{book.description || "Recurso destacado para esta materia."}</div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-4 border-t border-white/5 pt-3 font-dm-sans text-[11px] uppercase tracking-wider text-[#a3b3a6]/70">
            Aún no hay libros asociados a esta materia.
          </div>
        )}
      </div>
    );
  }

  // Staff view
  return (
    <div data-testid={`materia-item-${materia.id}`}
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-[#c9a227]/25 transition-colors">
      <div className="flex items-center gap-3 sm:w-56">
        <div className="w-11 h-11 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/25 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#c9a227]" />
        </div>
        <div className="min-w-0">
          <div className="font-cinzel text-base text-[#f4f1e1] truncate">{materia.name}</div>
          <div className="font-dm-sans text-[10px] tracking-widest uppercase text-[#a3b3a6]">
            {materia.url ? "Enlace guardado" : "Sin enlace"}
          </div>
        </div>
      </div>

      <input data-testid={`materia-input-${materia.id}`} type="url" value={url}
        onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/..."
        className="flex-1 bg-black/40 border border-[#c9a227]/20 rounded-sm px-4 py-2.5 text-sm font-dm-sans text-white placeholder:text-[#a3b3a6]/50 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] transition" />

      <div className="flex items-center gap-2">
        <button onClick={handleSave} disabled={!isValid || saving} data-testid={`materia-save-${materia.id}`}
          className="px-4 py-2.5 rounded-sm border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-[#020b04] transition-colors font-dm-sans text-xs tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
          {saving ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
        <a href={canGo ? materia.url : undefined} target="_blank" rel="noreferrer"
          onClick={(e) => { if (!canGo) e.preventDefault(); }} data-testid={`materia-go-${materia.id}`}
          className={`px-4 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase inline-flex items-center gap-1.5 transition-colors ${
            canGo ? "bg-[#c9a227] text-[#020b04] hover:bg-[#b08d22]" : "bg-[#c9a227]/20 text-[#c9a227]/40 cursor-not-allowed"
          }`} aria-disabled={!canGo}>
          Ir <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {canGo && (
          <button onClick={handleRemove} data-testid={`materia-remove-${materia.id}`}
            className="p-2.5 rounded-sm border border-red-900/50 text-red-400/80 hover:bg-red-950/50 transition-colors" title="Eliminar enlace">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const MateriasView = () => {
  const { hierCatId, hierarchyTree } = useLibrary();
  const { isStaff } = useAuth();
  const category = hierarchyTree.find((c) => c.id === hierCatId);
  if (!category) return null;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1] mb-2">{category.name}</h3>
        <p className="font-cormorant text-lg text-[#a3b3a6]">
          {isStaff ? "Gestiona los enlaces de Google Drive para cada materia."
                   : "Consulta los recursos disponibles por materia."}
        </p>
      </div>
      <div className="flex flex-col gap-4" data-testid="materias-list">
        {(category.subcategories || []).map((sub) => (
          <div key={sub.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-3 font-cinzel text-lg text-[#c9a227]">{sub.name}</div>
            <div className="flex flex-col gap-3">
              {(sub.materias || []).map((m) => (
                <MateriaItem key={m.id} materia={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LibraryModal = () => {
  const { modalOpen, closeModal, level } = useLibrary();

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-[#020b04]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={closeModal} data-testid="library-modal-overlay">
      <div className="w-full max-w-5xl bg-[#051a09] border border-[#c9a227]/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()} data-testid="library-modal">
        <div className="p-5 sm:p-6 border-b border-[#c9a227]/20 bg-[#020b04]/60 flex items-start gap-4">
          <div className="flex-1"><Breadcrumb /></div>
          <button onClick={closeModal} data-testid="modal-close-btn"
            className="p-2 rounded-full hover:bg-[#c9a227]/10 text-[#c9a227] transition" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
          {level === 0 && <CategoryView />}
          {level === 1 && <MateriasView />}
        </div>
      </div>
    </div>,
    document.body
  );
};
