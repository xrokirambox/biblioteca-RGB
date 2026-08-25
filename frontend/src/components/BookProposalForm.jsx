import React, { useState } from "react";
import { Lightbulb, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const BookProposalForm = () => {
  const { isTeacher, user, setLoginOpen } = useAuth();
  const [form, setForm] = useState({ teacher_name: user?.name || "", book_title: "", author: "", reason: "" });
  const [sending, setSending] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!isTeacher) return setLoginOpen(true);
    setSending(true);
    try {
      await api.post("/proposals", form);
      setForm({ teacher_name: user?.name || "", book_title: "", author: "", reason: "" });
      toast.success("Tu propuesta fue enviada para revisión.");
    } catch (error) {
      toast.error(error.response?.data?.detail || "No fue posible enviar la propuesta.");
    } finally { setSending(false); }
  };

  return (
    <section id="propuestas" className="py-20" data-testid="book-proposal-section">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="glass rounded-xl p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 sm:gap-12">
          <div>
            <div className="w-12 h-12 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-center mb-5"><Lightbulb className="w-6 h-6 text-[#c9a227]" /></div>
            <p className="font-dm-sans text-xs tracking-[0.25em] uppercase text-[#c9a227]">Participa en la biblioteca</p>
            <h2 className="mt-3 font-cinzel text-3xl sm:text-4xl text-[#f4f1e1] leading-tight">Propón un libro para próximas lecturas</h2>
            <p className="mt-4 font-cormorant text-xl text-[#a3b3a6] leading-relaxed">Los docentes pueden sugerir títulos para que rectoría y administración los revisen antes de agregarlos al catálogo.</p>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="sm:col-span-2 font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80">Nombre
              <input value={form.teacher_name} onChange={update("teacher_name")} required minLength="2" disabled={!isTeacher} placeholder="Tu nombre" className="mt-1.5 w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-3 text-sm text-white disabled:opacity-50" />
            </label>
            <label className="sm:col-span-2 font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80">Libro que te gustaría agregar
              <input value={form.book_title} onChange={update("book_title")} required minLength="2" disabled={!isTeacher} placeholder="Título del libro" className="mt-1.5 w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-3 text-sm text-white disabled:opacity-50" />
            </label>
            <label className="font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80">Autor (opcional)
              <input value={form.author} onChange={update("author")} disabled={!isTeacher} placeholder="Autor o autora" className="mt-1.5 w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-3 text-sm text-white disabled:opacity-50" />
            </label>
            <label className="font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80">Motivo (opcional)
              <input value={form.reason} onChange={update("reason")} disabled={!isTeacher} placeholder="¿Por qué lo recomiendas?" className="mt-1.5 w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-3 text-sm text-white disabled:opacity-50" />
            </label>
            <button type="submit" disabled={sending} className="sm:col-span-2 btn-gold mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm font-dm-sans text-xs font-semibold tracking-widest uppercase disabled:opacity-60">
              <Send className="w-4 h-4" /> {isTeacher ? (sending ? "Enviando..." : "Enviar propuesta") : "Ingresar como docente para proponer"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
