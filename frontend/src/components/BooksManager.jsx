import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Edit3, Loader2, BookOpen } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { CATEGORIAS } from "../data/materias";
import { toast } from "sonner";

const EMPTY = { title: "", author: "", category: "literatura", cover: "", url: "", description: "" };
const BOOK_CATEGORIES = (CATEGORIAS || []).filter((c) => c.id !== "all");

const BookForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(initial || EMPTY);
  useEffect(() => { setForm(initial || EMPTY); }, [initial]);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("El título es obligatorio");
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="book-form">
      <div className="sm:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Título *</label>
        <input data-testid="book-form-title" value={form.title} onChange={handle("title")} required
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]" />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Autor</label>
        <input data-testid="book-form-author" value={form.author} onChange={handle("author")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]" />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Categoría</label>
        <select data-testid="book-form-category" value={form.category} onChange={handle("category")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]">
          {BOOK_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#051a09]">{c.name}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Portada (URL de imagen)</label>
        <input data-testid="book-form-cover" value={form.cover} onChange={handle("cover")} placeholder="https://..."
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]" />
      </div>
      <div className="sm:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Enlace al libro</label>
        <input data-testid="book-form-url" type="url" value={form.url} onChange={handle("url")} placeholder="https://drive.google.com/..."
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]" />
      </div>
      <div className="sm:col-span-2">
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Descripción</label>
        <textarea data-testid="book-form-description" value={form.description} onChange={handle("description")} rows={3}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] resize-none" />
      </div>
      <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} data-testid="book-form-cancel"
            className="px-4 py-2.5 rounded-sm border border-[#a3b3a6]/40 text-[#a3b3a6] hover:border-[#a3b3a6] font-dm-sans text-xs tracking-widest uppercase">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={submitting} data-testid="book-form-submit"
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase disabled:opacity-60">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
      </div>
    </form>
  );
};

export const BooksManager = () => {
  const { books, createBook, updateBook, deleteBook, refreshBooks } = useLibrary();
  const [mode, setMode] = useState("list");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { refreshBooks(); }, [refreshBooks]);

  const handleCreate = async (form) => {
    try { setBusy(true); await createBook(form); toast.success("Libro creado"); setMode("list"); }
    catch (e) { toast.error(e.response?.data?.detail || "No se pudo crear"); }
    finally { setBusy(false); }
  };
  const handleUpdate = async (form) => {
    try { setBusy(true); await updateBook(editing.id, form); toast.success("Libro actualizado"); setMode("list"); setEditing(null); }
    catch (e) { toast.error(e.response?.data?.detail || "No se pudo actualizar"); }
    finally { setBusy(false); }
  };
  const handleDelete = async (book) => {
    if (!window.confirm(`¿Eliminar "${book.title}"?`)) return;
    try { await deleteBook(book.id); toast.success("Libro eliminado"); }
    catch { toast.error("No se pudo eliminar"); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-cinzel text-lg text-[#f4f1e1]">Gestión de libros</div>
          <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#a3b3a6]">{books.length} en catálogo</div>
        </div>
        {mode === "list" && (
          <button onClick={() => setMode("create")} data-testid="books-create-btn"
            className="btn-gold inline-flex items-center gap-2 px-4 py-2 rounded-sm font-dm-sans text-xs tracking-widest uppercase">
            <Plus className="w-3.5 h-3.5" /> Nuevo libro
          </button>
        )}
      </div>

      {mode === "create" && <BookForm onSubmit={handleCreate} onCancel={() => setMode("list")} submitting={busy} />}
      {mode === "edit" && editing && (
        <BookForm initial={editing} onSubmit={handleUpdate} onCancel={() => { setMode("list"); setEditing(null); }} submitting={busy} />
      )}

      {mode === "list" && (
        books.length === 0 ? (
          <div className="text-center py-16 font-cormorant text-xl text-[#a3b3a6]">
            Aún no hay libros. Crea el primero con el botón “Nuevo libro”.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="admin-books-list">
            {books.map((b) => (
              <div key={b.id} data-testid={`admin-book-${b.id}`} className="glass rounded-lg overflow-hidden flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                  {b.cover ? <img src={b.cover} alt={b.title} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-[#c9a227]/40"><BookOpen className="w-10 h-10" /></div>}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#020b04]/80 border border-[#c9a227]/30 font-dm-sans text-[9px] tracking-widest uppercase text-[#c9a227]">{b.category}</div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="font-cinzel text-sm text-[#f4f1e1] leading-tight line-clamp-2 mb-1">{b.title}</div>
                  <div className="font-cormorant italic text-[#a3b3a6] text-sm mb-3 line-clamp-1">{b.author || "—"}</div>
                  <div className="mt-auto flex items-center gap-2">
                    <button onClick={() => { setEditing(b); setMode("edit"); }} data-testid={`admin-book-edit-${b.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm border border-[#c9a227]/50 text-[#c9a227] hover:bg-[#c9a227]/10 font-dm-sans text-[10px] tracking-widest uppercase">
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={() => handleDelete(b)} data-testid={`admin-book-delete-${b.id}`}
                      className="p-2 rounded-sm border border-red-900/50 text-red-400/80 hover:bg-red-950/50" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
