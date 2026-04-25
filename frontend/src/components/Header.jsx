import React, { useState, useRef } from "react";
import { Library, Menu, X, LogOut, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const NAV_LINKS = [
  { id: "inicio", label: "Inicio", href: "#inicio" },
  { id: "salones", label: "Salones", href: "#salones" },
  { id: "destacados", label: "Destacados", href: "#destacados" },
  { id: "buscar", label: "Buscar", href: "#buscar" },
];

export const Header = ({ onOpenLibrary }) => {
  const [open, setOpen] = useState(false);
  const { isAdmin, setLoginOpen, logout } = useAuth();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  // Discrete admin access:
  // - Ctrl/Cmd + click on the logo → opens admin login
  // - Triple click on the logo (within 800 ms) → opens admin login
  const handleLogoClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setLoginOpen(true);
      return;
    }
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 800);
    if (clickCount.current >= 3) {
      e.preventDefault();
      clickCount.current = 0;
      setLoginOpen(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
  };

  return (
    <header
      data-testid="app-header"
      className="fixed top-0 w-full z-40 backdrop-blur-2xl bg-[#020b04]/80 border-b border-[#c9a227]/20"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between h-20">
        <a
          href="#inicio"
          className="flex items-center gap-3 group select-none"
          data-testid="header-logo"
          onClick={handleLogoClick}
          title="Inicio"
        >
          <div className="w-11 h-11 rounded-full border border-[#c9a227]/50 bg-[#051a09] flex items-center justify-center shadow-[0_0_20px_rgba(201,162,39,0.2)] group-hover:shadow-[0_0_28px_rgba(201,162,39,0.45)] transition-shadow">
            <Library className="w-5 h-5 text-[#c9a227]" />
          </div>
          <div className="leading-tight">
            <div className="font-cinzel text-[#c9a227] text-lg tracking-wider">RGB</div>
            <div className="font-dm-sans text-[10px] uppercase tracking-[0.2em] text-[#a3b3a6]">
              Biblioteca Escolar
            </div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={l.href}
              data-testid={`nav-link-${l.id}`}
              className="font-dm-sans text-sm tracking-wide text-[#f4f1e1] hover:text-[#c9a227] transition-colors"
            >
              {l.label}
            </a>
          ))}
          {isAdmin && (
            <button
              onClick={handleLogout}
              data-testid="header-logout-btn"
              className="btn-outline-gold inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-dm-sans font-semibold tracking-widest uppercase"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          )}
          <button
            onClick={onOpenLibrary}
            data-testid="header-open-library-btn"
            className="btn-gold px-5 py-2 rounded-sm text-sm font-dm-sans font-semibold tracking-wide"
          >
            Abrir Biblioteca
          </button>
        </nav>

        <button
          className="md:hidden text-[#c9a227] p-2"
          onClick={() => setOpen((v) => !v)}
          data-testid="mobile-menu-toggle"
          aria-label="Menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#c9a227]/15 bg-[#020b04]/95 px-6 py-4 flex flex-col gap-4 animate-fade-in">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={l.href}
              onClick={() => setOpen(false)}
              data-testid={`mobile-nav-link-${l.id}`}
              className="font-dm-sans text-sm text-[#f4f1e1]"
            >
              {l.label}
            </a>
          ))}
          {isAdmin && (
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="btn-outline-gold inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-dm-sans font-semibold tracking-widest uppercase"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          )}
          <button
            onClick={() => { setOpen(false); onOpenLibrary(); }}
            data-testid="mobile-open-library-btn"
            className="btn-gold px-4 py-2 rounded-sm text-sm font-dm-sans font-semibold"
          >
            Abrir Biblioteca
          </button>
        </div>
      )}

      {isAdmin && (
        <div
          data-testid="admin-mode-banner"
          className="bg-[#c9a227]/15 border-t border-[#c9a227]/30 py-1.5 text-center font-dm-sans text-[10px] tracking-[0.3em] uppercase text-[#c9a227] flex items-center justify-center gap-2"
        >
          <Shield className="w-3 h-3" />
          Modo administrador activo
        </div>
      )}
    </header>
  );
};
