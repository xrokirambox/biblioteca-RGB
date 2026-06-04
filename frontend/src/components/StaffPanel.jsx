import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Users, History, LayoutDashboard, Layers } from "lucide-react";
import { BooksManager } from "./BooksManager";
import { UsersManager } from "./UsersManager";
import { AuditLog } from "./AuditLog";
import { CategoriesManager } from "./CategoriesManager";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "books", label: "Libros", icon: BookOpen },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "categories", label: "Salones", icon: Layers },
  { id: "audit", label: "Auditoría", icon: History },
];

export const StaffPanel = ({ open, onClose }) => {
  const { user, role } = useAuth();
  const [tab, setTab] = useState("books");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[55] bg-[#020b04]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      data-testid="staff-panel-overlay"
    >
      <div
        className="w-full max-w-6xl bg-[#051a09] border border-[#c9a227]/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        data-testid="staff-panel-modal"
      >
        {/* Header */}
       <div className="px-6 py-3 border-b border-[#c9a227]/20 bg-[#020b04]/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-[#c9a227]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-cinzel text-xl text-[#f4f1e1] truncate">Panel del Personal</div>
            <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#c9a227]">
              {user?.name || user?.email} · <span className="text-[#f4f1e1]/80">{role}</span>
            </div>
          </div>
          <button onClick={onClose} data-testid="staff-panel-close" className="p-2 rounded-full hover:bg-[#c9a227]/10 text-[#c9a227] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-[#c9a227]/15 bg-[#020b04]/30 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                data-testid={`staff-tab-${t.id}`}
                className={`relative px-4 py-2 inline-flex items-center gap-2 font-dm-sans text-xs tracking-widest uppercase transition-colors ${
                  active ? "text-[#c9a227]" : "text-[#a3b3a6] hover:text-[#f4f1e1]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {active && <span className="absolute bottom-0 inset-x-3 h-0.5 bg-[#c9a227]" />}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-1">
          {tab === "books" && <BooksManager />}
          {tab === "users" && <UsersManager />}
          {tab === "categories" && <CategoriesManager />}
          {tab === "audit" && <AuditLog />}
        </div>
      </div>
    </div>,
    document.body
  );
};
