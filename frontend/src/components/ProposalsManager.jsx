import React, { useCallback, useEffect, useState } from "react";
import { Check, ClipboardList, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

const STATUS = { pending: "Pendiente", attended: "Atendida", rejected: "No atendida" };

export const ProposalsManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const response = await api.get("/proposals"); setRequests(response.data || []); }
    catch (error) { toast.error(error.response?.data?.detail || "No se pudieron cargar las solicitudes"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const update = async (id, status) => {
    const responseReason = reasons[id] || "";
    if (status === "rejected" && !responseReason.trim()) return toast.error("Indica el motivo por el que no fue atendida");
    try {
      const response = await api.put(`/proposals/${id}`, { status, response_reason: responseReason });
      setRequests((items) => items.map((item) => item.id === id ? response.data : item));
      toast.success(status === "attended" ? "Solicitud marcada como atendida" : "Solicitud marcada como no atendida");
    } catch (error) { toast.error(error.response?.data?.detail || "No se pudo actualizar la solicitud"); }
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar esta solicitud?")) return;
    try { await api.delete(`/proposals/${id}`); setRequests((items) => items.filter((item) => item.id !== id)); toast.success("Solicitud eliminada"); }
    catch (error) { toast.error(error.response?.data?.detail || "No se pudo eliminar la solicitud"); }
  };

  if (loading) return <div className="py-12 flex justify-center text-[#c9a227]"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  return <div className="animate-fade-in"><div className="mb-6"><h3 className="font-cinzel text-xl text-[#f4f1e1]">Solicitudes de libros</h3><p className="font-cormorant text-lg text-[#a3b3a6]">Marca cada solicitud como atendida o explica por qué no se incorporará.</p></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{requests.length ? requests.map((item) => <article key={item.id} className="glass rounded-lg p-5"><div className="flex justify-between gap-3"><div><p className="font-cinzel text-lg text-[#f4f1e1]">{item.book_title}</p><p className="font-dm-sans text-xs text-[#c9a227]">{item.author || "Autor no indicado"}</p></div><span className="h-fit border border-[#c9a227]/30 px-2 py-1 text-[10px] uppercase tracking-wider text-[#c9a227]">{STATUS[item.status] || item.status}</span></div><p className="mt-3 font-cormorant text-[#a3b3a6]">{item.reason || "Sin motivo adicional."}</p><p className="mt-4 font-dm-sans text-[10px] uppercase tracking-wider text-[#a3b3a6]">Docente: {item.teacher_name}</p>{item.response_reason && <p className="mt-3 border-l-2 border-[#c9a227]/50 pl-3 font-dm-sans text-xs text-[#f4f1e1]"><span className="text-[#c9a227]">Respuesta: </span>{item.response_reason}</p>}{item.status === "pending" && <><textarea value={reasons[item.id] || ""} onChange={(event) => setReasons((current) => ({ ...current, [item.id]: event.target.value }))} rows="2" placeholder="Motivo si no se atenderá la solicitud" className="mt-4 w-full resize-none bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2 text-sm text-white placeholder:text-[#a3b3a6]/50" /><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => update(item.id, "attended")} className="inline-flex items-center gap-1 border border-green-500/40 px-3 py-2 text-[10px] uppercase tracking-wider text-green-300"><Check className="w-3 h-3" />Atendida</button><button onClick={() => update(item.id, "rejected")} className="inline-flex items-center gap-1 border border-red-500/40 px-3 py-2 text-[10px] uppercase tracking-wider text-red-300"><X className="w-3 h-3" />No atendida</button></div></>}<button onClick={() => remove(item.id)} className="mt-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-300 hover:text-red-200"><Trash2 className="w-3.5 h-3.5" />Eliminar solicitud</button></article>) : <div className="lg:col-span-2 py-12 text-center font-cormorant text-xl text-[#a3b3a6]"><ClipboardList className="w-8 h-8 mx-auto mb-3 text-[#c9a227]/60" />No hay solicitudes pendientes.</div>}</div></div>;
};
