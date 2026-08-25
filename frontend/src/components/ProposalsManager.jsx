import React, { useCallback, useEffect, useState } from "react";
import { Check, Lightbulb, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

const STATUS = { pending: "Pendiente", reviewed: "Revisada", accepted: "Aceptada", rejected: "No aprobada" };

export const ProposalsManager = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const response = await api.get("/proposals"); setProposals(response.data || []); }
    catch (error) { toast.error(error.response?.data?.detail || "No se pudieron cargar las propuestas"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const update = async (id, status) => {
    try {
      const response = await api.put(`/proposals/${id}`, { status });
      setProposals((items) => items.map((item) => item.id === id ? response.data : item));
      toast.success("Propuesta actualizada");
    } catch (error) { toast.error(error.response?.data?.detail || "No se pudo actualizar"); }
  };
  if (loading) return <div className="py-12 flex justify-center text-[#c9a227]"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  return <div className="animate-fade-in"><div className="mb-6"><h3 className="font-cinzel text-xl text-[#f4f1e1]">Propuestas de docentes</h3><p className="font-cormorant text-lg text-[#a3b3a6]">Revisa las sugerencias antes de incorporarlas al catálogo.</p></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{proposals.length ? proposals.map((item) => <article key={item.id} className="glass rounded-lg p-5"><div className="flex justify-between gap-3"><div><p className="font-cinzel text-lg text-[#f4f1e1]">{item.book_title}</p><p className="font-dm-sans text-xs text-[#c9a227]">{item.author || "Autor no indicado"}</p></div><span className="h-fit border border-[#c9a227]/30 px-2 py-1 text-[10px] uppercase tracking-wider text-[#c9a227]">{STATUS[item.status]}</span></div><p className="mt-3 font-cormorant text-[#a3b3a6]">{item.reason || "Sin motivo adicional."}</p><p className="mt-4 font-dm-sans text-[10px] uppercase tracking-wider text-[#a3b3a6]">Propuesto por {item.teacher_name}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => update(item.id, "accepted")} className="inline-flex items-center gap-1 border border-green-500/40 px-3 py-2 text-[10px] uppercase tracking-wider text-green-300"><Check className="w-3 h-3" />Aceptar</button><button onClick={() => update(item.id, "reviewed")} className="border border-[#c9a227]/40 px-3 py-2 text-[10px] uppercase tracking-wider text-[#c9a227]">Revisar</button><button onClick={() => update(item.id, "rejected")} className="inline-flex items-center gap-1 border border-red-500/40 px-3 py-2 text-[10px] uppercase tracking-wider text-red-300"><X className="w-3 h-3" />No aprobar</button></div></article>) : <div className="lg:col-span-2 py-12 text-center font-cormorant text-xl text-[#a3b3a6]"><Lightbulb className="w-8 h-8 mx-auto mb-3 text-[#c9a227]/60" />Aún no hay propuestas.</div>}</div></div>;
};
