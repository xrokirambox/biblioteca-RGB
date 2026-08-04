import React, { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { Loader2, History, Filter, Plus, Edit3, Trash2, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

const ACTION_ICONS = {
  create: Plus, update: Edit3, delete: Trash2, login: LogIn, logout: LogOut,
};

const ACTION_COLORS = {
  create: "text-emerald-400 border-emerald-700/40 bg-emerald-950/30",
  update: "text-amber-300 border-amber-700/40 bg-amber-950/30",
  delete: "text-rose-300 border-rose-700/40 bg-rose-950/30",
  login: "text-sky-300 border-sky-700/40 bg-sky-950/30",
  logout: "text-[#a3b3a6] border-[#a3b3a6]/30 bg-white/5",
};

const RESOURCE_LABELS = {
  book: "Libro", link: "Enlace", user: "Usuario", auth: "Sesión",
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es", { dateStyle: "short", timeStyle: "short" });
  } catch { return iso; }
};

export const AuditLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resourceFilter, setResourceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/audit?limit=200`);
      setEntries(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo cargar el log");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = entries.filter((e) => {
    const matchR = resourceFilter === "all" || e.resource_type === resourceFilter;
    const matchA = actionFilter === "all" || e.action === actionFilter;
    return matchR && matchA;
  });

  const RESOURCE_OPTS = ["all", "book", "link", "user", "auth"];
  const ACTION_OPTS = ["all", "create", "update", "delete", "login", "logout"];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <div className="font-cinzel text-lg text-[#f4f1e1] inline-flex items-center gap-2">
            <History className="w-4 h-4 text-[#c9a227]" />
            Registro de actividad
          </div>
          <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#a3b3a6]">
            {filtered.length} de {entries.length} eventos
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2" data-testid="audit-filters">
          <Filter className="w-3.5 h-3.5 text-[#c9a227]" />
          <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)} data-testid="audit-filter-resource"
            className="bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-1.5 text-xs font-dm-sans text-white focus:outline-none focus:border-[#c9a227]">
            {RESOURCE_OPTS.map((r) => <option key={r} value={r} className="bg-[#051a09]">{r === "all" ? "Todos los recursos" : RESOURCE_LABELS[r] || r}</option>)}
          </select>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} data-testid="audit-filter-action"
            className="bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-1.5 text-xs font-dm-sans text-white focus:outline-none focus:border-[#c9a227]">
            {ACTION_OPTS.map((a) => <option key={a} value={a} className="bg-[#051a09]">{a === "all" ? "Todas las acciones" : a}</option>)}
          </select>
          <button onClick={refresh} data-testid="audit-refresh"
            className="px-3 py-1.5 rounded-sm border border-[#c9a227]/40 text-[#c9a227] hover:bg-[#c9a227]/10 font-dm-sans text-[10px] tracking-widest uppercase">
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#c9a227]"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 font-cormorant text-xl text-[#a3b3a6]">No hay eventos para mostrar.</div>
      ) : (
        <div className="space-y-2 max-h-[48dvh] sm:max-h-[52dvh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar" data-testid="audit-list">
          {filtered.map((e) => {
            const Icon = ACTION_ICONS[e.action] || History;
            const color = ACTION_COLORS[e.action] || ACTION_COLORS.update;
            return (
              <div
                key={e.id}
                data-testid={`audit-entry-${e.id}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-[#c9a227]/25 transition-colors"
              >
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-dm-sans text-sm text-[#f4f1e1]">{e.user_email || "—"}</span>
                    <span className="font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/70">{e.user_role}</span>
                    <span className="font-dm-sans text-[10px] tracking-widest uppercase text-[#a3b3a6] ml-auto">{formatDate(e.timestamp)}</span>
                  </div>
                  <div className="font-dm-sans text-xs text-[#a3b3a6]">
                    <span className="text-[#c9a227]">{e.action}</span>
                    {" · "}
                    <span>{RESOURCE_LABELS[e.resource_type] || e.resource_type}</span>
                    {e.resource_id && <span className="text-[#a3b3a6]/70"> · {e.resource_id}</span>}
                  </div>
                  {e.details && Object.keys(e.details).length > 0 && (
                    <div className="font-dm-sans text-[10px] text-[#a3b3a6]/70 mt-1 truncate">
                      {Object.entries(e.details).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="mr-3">{k}: <span className="text-[#f4f1e1]/80">{typeof v === "string" ? v.slice(0, 60) : JSON.stringify(v).slice(0, 60)}</span></span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
