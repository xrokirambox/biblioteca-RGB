import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, ChevronRight, ChevronLeft, Sprout, BookOpenText, GraduationCap, Library,
  Sigma, BookOpen, Leaf, Globe2, Languages, Palette, Dumbbell, HeartHandshake,
  FlaskConical, Atom, TestTube2, ScrollText, Map, Cpu, FunctionSquare, Brain, LineChart,
  Save, ExternalLink, Check, Trash2, Lock,
} from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { NIVELES, getNivelById, getGradoById } from "../data/niveles";
import { MATERIAS } from "../data/materias";
import { toast } from "sonner";

const NIVEL_ICONS = { Sprout, BookOpenText, GraduationCap };
const MATERIA_ICONS = {
  Sigma, BookOpen, Leaf, Globe2, Languages, Palette, Dumbbell, HeartHandshake,
  FlaskConical, Atom, TestTube2, ScrollText, Map, Cpu, FunctionSquare, Brain, LineChart,
};

const Breadcrumb = () => {
  const { level, nivelId, gradoId, goBack } = useLibrary();
  const nivel = nivelId ? getNivelById(nivelId) : null;
  const grado = gradoId ? getGradoById(gradoId) : null;

  return (
    <div className="flex items-center gap-2 font-dm-sans text-xs sm:text-sm tracking-wide" data-testid="modal-breadcrumb">
      <Library className="w-4 h-4 text-[#c9a227]" />
      <span className="text-[#a3b3a6]">Biblioteca</span>
      {nivel && (<>
        <ChevronRight className="w-3.5 h-3.5 text-[#c9a227]/60" />
        <span className={level === 1 ? "text-[#c9a227]" : "text-[#a3b3a6]"}>{nivel.name}</span>
      </>)}
      {grado && (<>
        <ChevronRight className="w-3.5 h-3.5 text-[#c9a227]/60" />
        <span className="text-[#c9a227]">{grado.name}</span>
      </>)}
      {level > 0 && (
        <button
          onClick={goBack}
          data-testid="modal-back-btn"
          className="ml-auto inline-flex items-center gap-1 text-[#c9a227] hover:text-[#f4f1e1] transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </button>
      )}
    </div>
  );
};

const NivelView = () => {
  const { goToNivel } = useLibrary();
  return (
    <div className="animate-fade-in">
      <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1] mb-2">Selecciona un nivel</h3>
      <p className="font-cormorant text-lg text-[#a3b3a6] mb-8">Elige el nivel académico para explorar sus grados.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {NIVELES.map((n) => {
          const Icon = NIVEL_ICONS[n.icon] || BookOpenText;
          return (
            <button
              key={n.id}
              onClick={() => goToNivel(n.id)}
              data-testid={`modal-nivel-${n.id}`}
              className="group text-left glass rounded-lg p-6 hover:border-[#c9a227]/50 hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#c9a227]/10 flex items-center justify-center border border-[#c9a227]/30 mb-4">
                <Icon className="w-5 h-5 text-[#c9a227]" />
              </div>
              <div className="font-cinzel text-xl text-[#f4f1e1] mb-1">{n.name}</div>
              <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#c9a227] mb-3">{n.subtitle}</div>
              <div className="font-cormorant text-base text-[#a3b3a6]">{n.grados.length} grados</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const GradoView = () => {
  const { nivelId, goToGrado, links } = useLibrary();
  const nivel = getNivelById(nivelId);
  if (!nivel) return null;

  return (
    <div className="animate-fade-in">
      <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1] mb-2">{nivel.name}</h3>
      <p className="font-cormorant text-lg text-[#a3b3a6] mb-8">Selecciona un grado para ver sus materias.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {nivel.grados.map((g) => {
          const savedCount = Object.keys(links[g.id] || {}).length;
          return (
            <button
              key={g.id}
              onClick={() => goToGrado(g.id)}
              data-testid={`modal-grado-${g.id}`}
              className="group glass rounded-lg p-5 hover:border-[#c9a227]/50 hover:-translate-y-1 transition-all text-left"
            >
              <div className="flex items-baseline justify-between mb-3">
                <div className="font-cinzel text-3xl text-[#c9a227]">{g.short}</div>
                {savedCount > 0 && (
                  <div className="px-2 py-0.5 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/30 text-[#c9a227] font-dm-sans text-[10px] tracking-wider">
                    {savedCount}
                  </div>
                )}
              </div>
              <div className="font-dm-sans text-xs tracking-widest uppercase text-[#a3b3a6]">{g.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MateriaItem = ({ gradoId, materia }) => {
  const { links, saveLink, removeLink } = useLibrary();
  const { isAdmin } = useAuth();
  const savedUrl = links[gradoId]?.[materia.id] || "";
  const [url, setUrl] = useState(savedUrl);
  const [saving, setSaving] = useState(false);
  const Icon = MATERIA_ICONS[materia.icon] || BookOpen;

  useEffect(() => { setUrl(savedUrl); }, [savedUrl]);

  const isValid = url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
  const canGo = !!savedUrl;

  const handleSave = async () => {
    if (!isValid) {
      toast.error("Ingresa una URL válida (http, https o /).");
      return;
    }
    try {
      setSaving(true);
      await saveLink(gradoId, materia.id, url);
      toast.success(`Enlace guardado para ${materia.name}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo guardar el enlace");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeLink(gradoId, materia.id);
      setUrl("");
      toast.success("Enlace eliminado");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  // ---- Public (non-admin) view ----
  if (!isAdmin) {
    return (
      <div
        data-testid={`materia-item-${materia.id}`}
        className={`flex items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 ${canGo ? "hover:border-[#c9a227]/40" : ""} transition-colors`}
      >
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
          <a
            href={savedUrl}
            target="_blank"
            rel="noreferrer"
            data-testid={`materia-go-${materia.id}`}
            className="bg-[#c9a227] text-[#020b04] hover:bg-[#b08d22] px-4 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase inline-flex items-center gap-1.5 transition-colors"
          >
            Ir <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span
            data-testid={`materia-empty-${materia.id}`}
            className="px-4 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase text-[#a3b3a6]/50 border border-white/5"
          >
            No disponible
          </span>
        )}
      </div>
    );
  }

  // ---- Admin view ----
  return (
    <div
      data-testid={`materia-item-${materia.id}`}
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-[#c9a227]/25 transition-colors"
    >
      <div className="flex items-center gap-3 sm:w-56">
        <div className="w-11 h-11 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/25 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#c9a227]" />
        </div>
        <div className="min-w-0">
          <div className="font-cinzel text-base text-[#f4f1e1] truncate">{materia.name}</div>
          <div className="font-dm-sans text-[10px] tracking-widest uppercase text-[#a3b3a6]">
            {savedUrl ? "Enlace guardado" : "Sin enlace"}
          </div>
        </div>
      </div>

      <input
        data-testid={`materia-input-${materia.id}`}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://drive.google.com/..."
        className="flex-1 bg-black/40 border border-[#c9a227]/20 rounded-sm px-4 py-2.5 text-sm font-dm-sans text-white placeholder:text-[#a3b3a6]/50 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] transition"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          data-testid={`materia-save-${materia.id}`}
          className="px-4 py-2.5 rounded-sm border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-[#020b04] transition-colors font-dm-sans text-xs tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          {saving ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
        <a
          href={canGo ? savedUrl : undefined}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => { if (!canGo) e.preventDefault(); }}
          data-testid={`materia-go-${materia.id}`}
          className={`px-4 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase inline-flex items-center gap-1.5 transition-colors ${
            canGo
              ? "bg-[#c9a227] text-[#020b04] hover:bg-[#b08d22]"
              : "bg-[#c9a227]/20 text-[#c9a227]/40 cursor-not-allowed"
          }`}
          aria-disabled={!canGo}
        >
          Ir <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {canGo && (
          <button
            onClick={handleRemove}
            data-testid={`materia-remove-${materia.id}`}
            className="p-2.5 rounded-sm border border-red-900/50 text-red-400/80 hover:bg-red-950/50 transition-colors"
            title="Eliminar enlace"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const MateriasView = () => {
  const { gradoId } = useLibrary();
  const { isAdmin } = useAuth();
  const grado = getGradoById(gradoId);
  const materias = MATERIAS[gradoId] || [];
  if (!grado) return null;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="font-cinzel text-2xl sm:text-3xl text-[#f4f1e1] mb-2">{grado.name}</h3>
        <p className="font-cormorant text-lg text-[#a3b3a6]">
          {isAdmin
            ? "Gestiona los enlaces de Google\u00a0Drive para cada materia."
            : "Consulta los recursos disponibles por materia."}
        </p>
      </div>
      <div className="flex flex-col gap-3" data-testid="materias-list">
        {materias.map((m) => (
          <MateriaItem key={m.id} gradoId={gradoId} materia={m} />
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
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-[#020b04]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={closeModal}
      data-testid="library-modal-overlay"
    >
      <div
        className="w-full max-w-5xl bg-[#051a09] border border-[#c9a227]/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        data-testid="library-modal"
      >
        <div className="p-5 sm:p-6 border-b border-[#c9a227]/20 bg-[#020b04]/60 flex items-start gap-4">
          <div className="flex-1">
            <Breadcrumb />
          </div>
          <button
            onClick={closeModal}
            data-testid="modal-close-btn"
            className="p-2 rounded-full hover:bg-[#c9a227]/10 text-[#c9a227] transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
          {level === 0 && <NivelView />}
          {level === 1 && <GradoView />}
          {level === 2 && <MateriasView />}
        </div>
      </div>
    </div>,
    document.body
  );
};
