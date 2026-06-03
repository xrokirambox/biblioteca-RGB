import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Edit3, Loader2, Eye, EyeOff, Users } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { toast } from "sonner";

const EMPTY = { name: "", description: "", audience: "general", status: "show" };
const AUDIENCE_OPTIONS = [
  { id: "general", label: "General" },
  { id: "estudiantes", label: "Estudiantes" },
  { id: "profesores", label: "Profesores" },
];

const CategoryForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(initial || EMPTY);

  useEffect(() => {
    setForm(initial || EMPTY);
  }, [initial]);

  const handle = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    await onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      audience: form.audience,
      status: form.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="category-form">
      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Nombre *</label>
        <input
          data-testid="category-form-name"
          value={form.name}
          onChange={handle("name")}
          placeholder="Ej. Estudiantes generales"
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        />
      </div>

      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Audiencia</label>
        <select
          data-testid="category-form-audience"
          value={form.audience}
          onChange={handle("audience")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        >
          {AUDIENCE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id} className="bg-[#051a09]">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Estado</label>
        <select
          data-testid="category-form-status"
          value={form.status}
          onChange={handle("status")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        >
          <option value="show">Mostrar</option>
          <option value="hide">Ocultar</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Descripción</label>
        <textarea
          data-testid="category-form-description"
          value={form.description}
          onChange={handle("description")}
          rows={3}
          placeholder="Descripción breve de la categoría"
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] resize-none"
        />
      </div>

      <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            data-testid="category-form-cancel"
            className="px-4 py-2.5 rounded-sm border border-[#a3b3a6]/40 text-[#a3b3a6] hover:border-[#a3b3a6] font-dm-sans text-xs tracking-widest uppercase"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          data-testid="category-form-submit"
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
      </div>
    </form>
  );
};

export const CategoriesManager = () => {
  const { categories, createCategory, updateCategory, deleteCategory, refreshCategories } = useLibrary();
  const [mode, setMode] = useState("list");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const handleCreate = async (form) => {
    try {
      setBusy(true);
      await createCategory(form);
      toast.success("Categoría creada");
      setMode("list");
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo crear la categoría");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (form) => {
    try {
      setBusy(true);
      await updateCategory(editing.id, form);
      toast.success("Categoría actualizada");
      setMode("list");
      setEditing(null);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo actualizar la categoría");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`¿Eliminar categoría "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      toast.success("Categoría eliminada");
    } catch {
      toast.error("No se pudo eliminar la categoría");
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await updateCategory(category.id, {
        status: category.status === "show" ? "hide" : "show",
      });
      toast.success(`Categoría ${category.status === "show" ? "ocultada" : "mostrada"}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo cambiar el estado");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-cinzel text-lg text-[#f4f1e1]">Gestión de salones</div>
          <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#a3b3a6]">
            {categories.length} categorías registradas
          </div>
        </div>
        {mode === "list" && (
          <button
            onClick={() => setMode("create")}
            data-testid="categories-create-btn"
            className="btn-gold inline-flex items-center gap-2 px-4 py-2 rounded-sm font-dm-sans text-xs tracking-widest uppercase"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva categoría
          </button>
        )}
      </div>

      {mode === "create" && <CategoryForm onSubmit={handleCreate} onCancel={() => setMode("list")} submitting={busy} />}
      {mode === "edit" && editing && (
        <CategoryForm
          initial={editing}
          onSubmit={handleUpdate}
          onCancel={() => { setMode("list"); setEditing(null); }}
          submitting={busy}
        />
      )}

      {mode === "list" && (
        categories.length === 0 ? (
          <div className="text-center py-16 font-cormorant text-xl text-[#a3b3a6]">
            No hay categorías aún. Crea una desde el botón “Nueva categoría”.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="admin-categories-list">
            {categories.map((category) => (
              <div key={category.id} className="glass rounded-xl overflow-hidden flex flex-col border border-[#c9a227]/10">
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="font-cinzel text-xl text-[#f4f1e1] leading-tight">{category.name}</div>
                      <div className="font-dm-sans text-[10px] uppercase tracking-[0.25em] text-[#c9a227]/80 mt-1">
                        {AUDIENCE_OPTIONS.find((o) => o.id === category.audience)?.label || "General"}
                      </div>
                    </div>
                    <div className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#020b04] bg-[#c9a227]/10">
                      {category.status === "show" ? "Visible" : "Oculto"}
                    </div>
                  </div>
                  <p className="font-cormorant text-sm text-[#a3b3a6] min-h-[3rem]">{category.description || "Sin descripción"}</p>
                </div>
                <div className="border-t border-[#c9a227]/10 bg-[#020b04]/40 p-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditing(category); setMode("edit"); }}
                    data-testid={`admin-category-edit-${category.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-sm border border-[#c9a227]/50 text-[#c9a227] hover:bg-[#c9a227]/10 font-dm-sans text-[10px] tracking-widest uppercase"
                  >
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(category)}
                    data-testid={`admin-category-toggle-${category.id}`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-sm border border-[#c9a227]/50 text-[#c9a227] hover:bg-[#c9a227]/10 font-dm-sans text-[10px] tracking-widest uppercase"
                  >
                    {category.status === "show" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {category.status === "show" ? "Ocultar" : "Mostrar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    data-testid={`admin-category-delete-${category.id}`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-sm border border-red-900/50 text-red-400/80 hover:bg-red-950/50 font-dm-sans text-[10px] tracking-widest uppercase"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
