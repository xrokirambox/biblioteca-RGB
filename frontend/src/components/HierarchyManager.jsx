import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, CreditCard as Edit3, Loader as Loader2, ChevronDown, ChevronRight, BookOpen, X, Folder, FileText, Link2, GripVertical, ArrowRight } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { toast } from "sonner";

const LUCIDE_ICONS = [
  "BookOpen", "BookOpenText", "GraduationCap", "Sprout", "Folder",
  "FileText", "Link2", "Sigma", "FlaskConical", "Atom", "TestTube2",
  "Globe2", "Languages", "Palette", "Dumbbell", "HeartHandshake",
  "ScrollText", "Map", "Cpu", "FunctionSquare", "Brain", "LineChart",
  "Leaf", "Library", "School", "Award", "Star", "Bookmark", "BookMarked",
  "BookX", "BookCheck", "PenTool", "Ruler", "Calculator", "Compass",
  "Music", "Monitor", "Code", "Database", "Layers", "Grid", "Layout",
  "List", "CheckSquare", "Clipboard", "FileCode", "Hash", "Binary",
  "Network", "Share2", "Shield", "Lock", "Key", "Unlock", "Zap",
  "Sun", "Moon", "Cloud", "Wind", "Droplets", "Thermometer", "Microscope",
  "Telescope", "Satellite", "Rocket", "Plane", "Car", "Train", "Truck",
  "Ship", "Anchor", "Flag", "MapPin", "Navigation", "Globe", "Earth",
  "Users", "User", "UserCheck", "UserPlus", "Mail", "Phone", "MessageCircle",
  "MessageSquare", "Bell", "Search", "Filter", "BarChart",
  "PieChart", "TrendingUp", "Activity", "Heart", "ThumbsUp", "Eye",
  "Printer", "Download", "Upload", "Paperclip", "Tag", "Tags", "Circle",
  "Square", "Triangle", "Hexagon", "Octagon", "Diamond", "Crown",
  "Trophy", "Medal", "Gift", "ShoppingCart", "Wallet", "CreditCard",
  "Receipt", "Invoice", "Package", "Box", "Archive", "Trash",
  "RefreshCw", "RotateCcw", "Undo", "Redo", "Scissors", "Copy",
  "ClipboardList", "ClipboardCheck", "FilePlus", "FileMinus", "FileEdit",
  "ExternalLink", "LogIn", "LogOut", "Settings", "Sliders", "ToggleLeft",
  "ToggleRight", "Wifi", "Bluetooth", "Cast", "Airplay", "Radio",
  "Tv", "MonitorPlay", "Film", "Video", "Camera", "Image", "Images",
  "Aperture", "Focus", "ZoomIn", "ZoomOut", "Maximize", "Minimize",
  "Move", "AlignLeft", "AlignCenter", "AlignRight", "AlignJustify",
  "Bold", "Italic", "Underline", "Strikethrough", "Heading", "Type",
  "Quote", "Code2", "Terminal", "Bug", "GitBranch", "GitCommit",
  "GitMerge", "GitPullRequest", "Github", "Gitlab", "Chrome", "Globe",
  "Home", "Building", "Building2", "Warehouse", "Hospital", "Hotel",
  "Store", "Landmark", "Church", "Castle", "TreePine", "TreeDeciduous",
  "Flower", "Flower2", "Mountain", "MountainSnow", "Volcano", " Waves",
  "Umbrella", "Snowflake", "Flame", "FireExtinguisher", "Siren",
  "AlertTriangle", "AlertCircle", "Info", "HelpCircle", "Question",
  "CheckCircle", "XCircle", "MinusCircle", "PlusCircle", "DivideCircle",
  "PlayCircle", "PauseCircle", "StopCircle", "SkipForward", "SkipBack",
  "Rewind", "FastForward", "Repeat", "Shuffle", "Volume", "Volume1",
  "Volume2", "VolumeX", "Mic", "MicOff", "Headphones", "Speaker",
  "Watch", "Clock", "AlarmClock", "Timer", "Hourglass", "Calendar",
  "CalendarCheck", "CalendarX", "CalendarPlus", "CalendarMinus", "CalendarClock",
  "Pin", "PinOff", "Map", "MapPinned", "Navigation", "Locate",
  "LocateFixed", "LocateOff", "Crosshair", "Target", "Bullseye",
  "Radar", "Scan", "ScanLine", "ScanFace", "ScanEye", "ScanSearch",
  "Fingerprint", "ScanText", "Barcode", "QrCode", "Ticket", "TicketCheck",
];

const IconPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white flex items-center gap-2 focus:outline-none focus:border-[#c9a227]"
      >
        <span className="text-[#c9a227]">{value || "BookOpen"}</span>
        <span className="ml-auto text-[#a3b3a6]/60 text-xs">Cambiar</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-[#051a09] border border-[#c9a227]/30 rounded-sm p-2 grid grid-cols-4 gap-1">
          {LUCIDE_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => { onChange(icon); setOpen(false); }}
              className={`text-[10px] p-1.5 rounded-sm text-center transition ${value === icon ? "bg-[#c9a227]/20 text-[#c9a227]" : "text-[#a3b3a6] hover:bg-white/5"}`}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(initial || { name: "", description: "", icon: "BookOpen", sort_order: 0 });

  useEffect(() => {
    setForm(initial || { name: "", description: "", icon: "BookOpen", sort_order: 0 });
  }, [initial]);

  const handle = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleIcon = (icon) => setForm((prev) => ({ ...prev, icon }));
  const handleNum = (key) => (e) => setForm((prev) => ({ ...prev, [key]: parseInt(e.target.value || "0", 10) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    await onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon || "BookOpen",
      sort_order: form.sort_order || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#020b04]/40 border border-[#c9a227]/10 rounded-lg p-4">
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Nombre *</label>
        <input
          value={form.name}
          onChange={handle("name")}
          placeholder="Ej. Primaria"
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Icono</label>
        <IconPicker value={form.icon} onChange={handleIcon} />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Orden</label>
        <input
          type="number"
          value={form.sort_order}
          onChange={handleNum("sort_order")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Descripción</label>
        <textarea
          value={form.description}
          onChange={handle("description")}
          rows={2}
          placeholder="Descripción breve"
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] resize-none"
        />
      </div>
      <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 rounded-sm border border-[#a3b3a6]/40 text-[#a3b3a6] hover:border-[#a3b3a6] font-dm-sans text-xs tracking-widest uppercase">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={submitting}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase disabled:opacity-60">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
      </div>
    </form>
  );
};

const SubcategoryForm = ({ categories, initial, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(initial || { name: "", category_id: "", description: "", icon: "BookOpen", sort_order: 0 });

  useEffect(() => {
    setForm(initial || { name: "", category_id: (categories[0]?.id || ""), description: "", icon: "BookOpen", sort_order: 0 });
  }, [initial, categories]);

  const handle = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleIcon = (icon) => setForm((prev) => ({ ...prev, icon }));
  const handleNum = (key) => (e) => setForm((prev) => ({ ...prev, [key]: parseInt(e.target.value || "0", 10) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    if (!form.category_id) return toast.error("Selecciona una categoría");
    await onSubmit({
      name: form.name.trim(),
      category_id: form.category_id,
      description: form.description.trim(),
      icon: form.icon || "BookOpen",
      sort_order: form.sort_order || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#020b04]/40 border border-[#c9a227]/10 rounded-lg p-4">
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Categoría padre *</label>
        <select
          value={form.category_id}
          onChange={handle("category_id")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#051a09]">{c.name}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Nombre *</label>
        <input
          value={form.name}
          onChange={handle("name")}
          placeholder="Ej. 1º Primaria"
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Icono</label>
        <IconPicker value={form.icon} onChange={handleIcon} />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Orden</label>
        <input
          type="number"
          value={form.sort_order}
          onChange={handleNum("sort_order")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Descripción</label>
        <textarea
          value={form.description}
          onChange={handle("description")}
          rows={2}
          placeholder="Descripción breve"
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] resize-none"
        />
      </div>
      <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 rounded-sm border border-[#a3b3a6]/40 text-[#a3b3a6] hover:border-[#a3b3a6] font-dm-sans text-xs tracking-widest uppercase">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={submitting}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase disabled:opacity-60">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
      </div>
    </form>
  );
};

const MateriaForm = ({ subcategories, initial, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(initial || { name: "", subcategory_id: "", description: "", icon: "BookOpen", url: "", notebook_url: "" });

  useEffect(() => {
    setForm(initial || { name: "", subcategory_id: (subcategories[0]?.id || ""), description: "", icon: "BookOpen", url: "", notebook_url: "" });
  }, [initial, subcategories]);

  const handle = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleIcon = (icon) => setForm((prev) => ({ ...prev, icon }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    if (!form.subcategory_id) return toast.error("Selecciona una subcategoría");
    await onSubmit({
      name: form.name.trim(),
      subcategory_id: form.subcategory_id,
      description: form.description.trim(),
      icon: form.icon || "BookOpen",
      url: form.url.trim(),
      notebook_url: (form.notebook_url || "").trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#020b04]/40 border border-[#c9a227]/10 rounded-lg p-4">
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Subcategoría padre *</label>
        <select
          value={form.subcategory_id}
          onChange={handle("subcategory_id")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        >
          {subcategories.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#051a09]">{s.name}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Nombre *</label>
        <input
          value={form.name}
          onChange={handle("name")}
          placeholder="Ej. Matemáticas"
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Icono</label>
        <IconPicker value={form.icon} onChange={handleIcon} />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">URL</label>
        <input
          value={form.url}
          onChange={handle("url")}
          placeholder="https://drive.google.com/..."
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Enlace de NotebookLM</label>
        <input
          value={form.notebook_url || ""}
          onChange={handle("notebook_url")}
          placeholder="https://notebooklm.google.com/notebook/..."
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Descripción</label>
        <textarea
          value={form.description}
          onChange={handle("description")}
          rows={2}
          placeholder="Descripción breve"
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] resize-none"
        />
      </div>
      <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 rounded-sm border border-[#a3b3a6]/40 text-[#a3b3a6] hover:border-[#a3b3a6] font-dm-sans text-xs tracking-widest uppercase">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={submitting}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase disabled:opacity-60">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
      </div>
    </form>
  );
};

export const HierarchyManager = () => {
  const {
    hierarchyTree, hierarchyCategories, hierarchySubcategories, hierarchyMaterias,
    createHierarchyCategory, updateHierarchyCategory, deleteHierarchyCategory,
    createSubcategory, updateSubcategory, deleteSubcategory,
    createHierarchyMateria, updateHierarchyMateria, deleteHierarchyMateria,
    refreshHierarchyTree,
  } = useLibrary();

  const [mode, setMode] = useState("list");
  const [entityType, setEntityType] = useState("category");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [expandedCats, setExpandedCats] = useState(new Set());
  const [expandedSubs, setExpandedSubs] = useState(new Set());

  useEffect(() => {
    refreshHierarchyTree();
  }, [refreshHierarchyTree]);

  const toggleCat = (id) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSub = (id) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startCreate = (type) => {
    setEntityType(type);
    setEditing(null);
    setMode("create");
  };

  const startEdit = (type, item) => {
    setEntityType(type);
    setEditing(item);
    setMode("edit");
  };

  const cancel = () => {
    setMode("list");
    setEditing(null);
  };

  const handleCreateCategory = async (form) => {
    try {
      setBusy(true);
      await createHierarchyCategory(form);
      toast.success("Categoría creada");
      cancel();
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo crear");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateCategory = async (form) => {
    try {
      setBusy(true);
      await updateHierarchyCategory(editing.id, form);
      toast.success("Categoría actualizada");
      cancel();
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`¿Eliminar "${cat.name}"? Se eliminarán todas sus subcategorías y materias.`)) return;
    try {
      await deleteHierarchyCategory(cat.id);
      toast.success("Categoría eliminada");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  const handleCreateSubcategory = async (form) => {
    try {
      setBusy(true);
      await createSubcategory(form);
      toast.success("Subcategoría creada");
      cancel();
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo crear");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateSubcategory = async (form) => {
    try {
      setBusy(true);
      await updateSubcategory(editing.id, form);
      toast.success("Subcategoría actualizada");
      cancel();
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSubcategory = async (sub) => {
    if (!window.confirm(`¿Eliminar "${sub.name}"? Se eliminarán todas sus materias.`)) return;
    try {
      await deleteSubcategory(sub.id);
      toast.success("Subcategoría eliminada");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  const handleCreateMateria = async (form) => {
    try {
      setBusy(true);
      await createHierarchyMateria(form);
      toast.success("Materia creada");
      cancel();
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo crear");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateMateria = async (form) => {
    try {
      setBusy(true);
      await updateHierarchyMateria(editing.id, form);
      toast.success("Materia actualizada");
      cancel();
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteMateria = async (mat) => {
    if (!window.confirm(`¿Eliminar "${mat.name}"?`)) return;
    try {
      await deleteHierarchyMateria(mat.id);
      toast.success("Materia eliminada");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  const renderForm = () => {
    if (entityType === "category") {
      return (
        <CategoryForm
          initial={editing}
          onSubmit={editing ? handleUpdateCategory : handleCreateCategory}
          onCancel={cancel}
          submitting={busy}
        />
      );
    }
    if (entityType === "subcategory") {
      return (
        <SubcategoryForm
          categories={hierarchyCategories}
          initial={editing}
          onSubmit={editing ? handleUpdateSubcategory : handleCreateSubcategory}
          onCancel={cancel}
          submitting={busy}
        />
      );
    }
    return (
      <MateriaForm
        subcategories={hierarchySubcategories}
        initial={editing}
        onSubmit={editing ? handleUpdateMateria : handleCreateMateria}
        onCancel={cancel}
        submitting={busy}
      />
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-cinzel text-lg text-[#f4f1e1]">Jerarquía académica</div>
          <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#a3b3a6]">
            {hierarchyCategories.length} categorías · {hierarchySubcategories.length} subcategorías · {hierarchyMaterias.length} materias
          </div>
        </div>
        {mode === "list" && (
          <div className="flex items-center gap-2">
            <button onClick={() => startCreate("materia")}
              className="btn-gold inline-flex items-center gap-2 px-3 py-2 rounded-sm font-dm-sans text-[10px] tracking-widest uppercase">
              <Plus className="w-3 h-3" /> Materia
            </button>
            <button onClick={() => startCreate("subcategory")}
              className="btn-gold inline-flex items-center gap-2 px-3 py-2 rounded-sm font-dm-sans text-[10px] tracking-widest uppercase">
              <Plus className="w-3 h-3" /> Subcategoría
            </button>
            <button onClick={() => startCreate("category")}
              className="btn-gold inline-flex items-center gap-2 px-3 py-2 rounded-sm font-dm-sans text-[10px] tracking-widest uppercase">
              <Plus className="w-3 h-3" /> Categoría
            </button>
          </div>
        )}
      </div>

      {mode !== "list" && (
        <div className="mb-6">
          <div className="font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-3">
            {editing ? "Editar" : "Nueva"} {entityType === "category" ? "categoría" : entityType === "subcategory" ? "subcategoría" : "materia"}
          </div>
          {renderForm()}
        </div>
      )}

      {mode === "list" && (
        hierarchyTree.length === 0 ? (
          <div className="text-center py-16 font-cormorant text-xl text-[#a3b3a6]">
            No hay jerarquía configurada. Crea una categoría para empezar.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {hierarchyTree.map((category) => (
              <div key={category.id} className="glass rounded-xl border border-[#c9a227]/10 overflow-hidden">
                {/* Category header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[#020b04]/40">
                  <button onClick={() => toggleCat(category.id)} className="text-[#c9a227] hover:text-[#f4f1e1] transition">
                    {expandedCats.has(category.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <Folder className="w-4 h-4 text-[#c9a227]" />
                  <div className="flex-1 min-w-0">
                    <div className="font-cinzel text-base text-[#f4f1e1]">{category.name}</div>
                    <div className="font-dm-sans text-[10px] tracking-widest uppercase text-[#a3b3a6]">
                      {category.subcategories?.length || 0} subcategorías
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit("category", category)}
                      className="p-1.5 rounded-sm border border-[#c9a227]/30 text-[#c9a227] hover:bg-[#c9a227]/10 transition">
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeleteCategory(category)}
                      className="p-1.5 rounded-sm border border-red-900/30 text-red-400/70 hover:bg-red-950/30 transition">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCats.has(category.id) && (
                  <div className="border-t border-[#c9a227]/10">
                    {(category.subcategories || []).length === 0 ? (
                      <div className="px-4 py-6 text-center font-dm-sans text-xs text-[#a3b3a6]/60">
                        Sin subcategorías. Crea una subcategoría para esta categoría.
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="border-b border-[#c9a227]/5 last:border-b-0">
                            <div className="flex items-center gap-3 px-4 py-2.5 pl-10 bg-[#020b04]/20">
                              <button onClick={() => toggleSub(sub.id)} className="text-[#c9a227]/60 hover:text-[#c9a227] transition">
                                {expandedSubs.has(sub.id) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                              <FileText className="w-3.5 h-3.5 text-[#c9a227]/70" />
                              <div className="flex-1 min-w-0">
                                <div className="font-dm-sans text-sm text-[#f4f1e1]">{sub.name}</div>
                                <div className="font-dm-sans text-[10px] text-[#a3b3a6]/60">
                                  {sub.materias?.length || 0} materias
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => startEdit("subcategory", sub)}
                                  className="p-1 rounded-sm border border-[#c9a227]/20 text-[#c9a227]/60 hover:text-[#c9a227] hover:bg-[#c9a227]/10 transition">
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleDeleteSubcategory(sub)}
                                  className="p-1 rounded-sm border border-red-900/20 text-red-400/50 hover:text-red-400 hover:bg-red-950/30 transition">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Materias */}
                            {expandedSubs.has(sub.id) && (
                              <div className="border-t border-[#c9a227]/5">
                                {(sub.materias || []).length === 0 ? (
                                  <div className="px-4 py-4 pl-16 text-center font-dm-sans text-[10px] text-[#a3b3a6]/50">
                                    Sin materias. Crea una materia para esta subcategoría.
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    {sub.materias.map((mat) => (
                                      <div key={mat.id} className="flex items-center gap-3 px-4 py-2 pl-16 border-b border-[#c9a227]/5 last:border-b-0">
                                        <BookOpen className="w-3 h-3 text-[#c9a227]/50" />
                                        <div className="flex-1 min-w-0">
                                          <div className="font-dm-sans text-xs text-[#f4f1e1]/90">{mat.name}</div>
                                          {mat.url && (
                                            <div className="font-dm-sans text-[10px] text-[#c9a227]/50 truncate">
                                              <Link2 className="w-2.5 h-2.5 inline mr-1" />{mat.url}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <button onClick={() => startEdit("materia", mat)}
                                            className="p-1 rounded-sm border border-[#c9a227]/15 text-[#c9a227]/50 hover:text-[#c9a227] hover:bg-[#c9a227]/10 transition">
                                            <Edit3 className="w-3 h-3" />
                                          </button>
                                          <button onClick={() => handleDeleteMateria(mat)}
                                            className="p-1 rounded-sm border border-red-900/15 text-red-400/40 hover:text-red-400 hover:bg-red-950/30 transition">
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
