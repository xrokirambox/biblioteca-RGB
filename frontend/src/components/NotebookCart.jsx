import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Clipboard, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLibrary } from "../context/LibraryContext";

const STORAGE_KEY = "rgb_notebook_cart";

export const NotebookCart = ({ books, selectedIds, onRemove, onClose, onPublish }) => {
  const { hierarchyMaterias, updateHierarchyMateria } = useLibrary();
  const selectedBooks = useMemo(() => books.filter((book) => selectedIds.includes(book.id)), [books, selectedIds]);
  const [materiaId, setMateriaId] = useState("");
  const [notebookUrl, setNotebookUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const materia = (hierarchyMaterias || []).find((item) => item.id === materiaId);
  useEffect(() => { setNotebookUrl(materia?.notebook_url || ""); }, [materia]);

  const sources = selectedBooks
    .filter((book) => book.url)
    .map((book) => `${book.title}${book.author ? ` — ${book.author}` : ""}\n${book.url}`)
    .join("\n\n");

  const copySources = async () => {
    if (!sources) return toast.error("Los libros seleccionados no tienen enlaces para enviar.");
    await navigator.clipboard.writeText(sources);
    setCopied(true);
    toast.success("Fuentes copiadas al portapapeles.");
  };

  const openNotebook = async () => {
    try { await copySources(); } catch { return toast.error("No fue posible copiar las fuentes."); }
    window.open(notebookUrl || "https://notebooklm.google.com/", "_blank", "noopener,noreferrer");
  };

  const publish = async () => {
    if (!materiaId) return toast.error("Selecciona la materia que usará este notebook.");
    if (!/^https?:\/\//.test(notebookUrl)) return toast.error("Pega un enlace válido de NotebookLM.");
    try {
      setSaving(true);
      await updateHierarchyMateria(materiaId, { notebook_url: notebookUrl.trim() });
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Notebook publicado para los estudiantes.");
      onPublish();
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo guardar el enlace.");
    } finally { setSaving(false); }
  };

  return (
    <section className="glass rounded-lg border border-[#c9a227]/20 p-5 animate-fade-in" data-testid="notebook-cart">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div><h3 className="font-cinzel text-xl text-[#f4f1e1]">Preparar NotebookLM</h3><p className="font-cormorant text-[#a3b3a6]">{selectedBooks.length} libros seleccionados para estudiar con IA.</p></div>
        <button onClick={onClose} className="text-xs text-[#a3b3a6] hover:text-white">Volver al catálogo</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227] mb-2">Tu carrito</p>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {selectedBooks.map((book) => <div key={book.id} className="flex items-center gap-3 p-2 bg-black/20 rounded-sm"><BookOpen className="w-4 h-4 text-[#c9a227]" /><span className="flex-1 text-sm text-[#f4f1e1]">{book.title}</span><button onClick={() => onRemove(book.id)} className="text-red-400/70 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></div>)}
          </div>
          <button onClick={copySources} disabled={!sources} className="mt-4 w-full border border-[#c9a227]/40 text-[#c9a227] px-3 py-2 rounded-sm text-xs tracking-widest uppercase inline-flex justify-center items-center gap-2 disabled:opacity-40"><Clipboard className="w-3.5 h-3.5" />{copied ? "Fuentes copiadas" : "Copiar fuentes"}</button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-[#c9a227]/10 border border-[#c9a227]/20 rounded-sm text-sm text-[#f4f1e1] leading-relaxed"><strong>Pasos:</strong> 1. Copia las fuentes. 2. Abre NotebookLM. 3. Crea o actualiza un notebook y pega los enlaces en “Agregar fuentes”. 4. Copia el enlace del notebook y pégalo abajo.</div>
          <select value={materiaId} onChange={(e) => setMateriaId(e.target.value)} className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm text-white"><option value="">Selecciona la materia para publicar</option>{(hierarchyMaterias || []).map((item) => <option key={item.id} value={item.id} className="bg-[#051a09]">{item.name}</option>)}</select>
          <button onClick={openNotebook} className="btn-gold w-full px-3 py-2.5 rounded-sm text-xs tracking-widest uppercase inline-flex justify-center items-center gap-2"><ExternalLink className="w-3.5 h-3.5" />Abrir NotebookLM</button>
          <input value={notebookUrl} onChange={(e) => setNotebookUrl(e.target.value)} placeholder="Pega aquí el enlace del notebook terminado" className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm text-white" />
          <button onClick={publish} disabled={saving} className="w-full border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-[#020b04] px-3 py-2.5 rounded-sm text-xs tracking-widest uppercase inline-flex justify-center items-center gap-2 disabled:opacity-50"><Check className="w-3.5 h-3.5" />{saving ? "Publicando..." : "Guardar y publicar"}</button>
        </div>
      </div>
    </section>
  );
};

export const getSavedNotebookCart = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};

export const saveNotebookCart = (ids) => localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
