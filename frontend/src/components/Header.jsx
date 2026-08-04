import React, { useState, useRef } from "react";
import { Menu, X, LogOut, Shield, ShoppingCart } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { toast } from "sonner";

const NAV_LINKS = [
  { id: "inicio", label: "Inicio", href: "#inicio" },
  { id: "salones", label: "Salones", href: "#salones" },
  { id: "destacados", label: "Libros", href: "#destacados" },
  { id: "buscar", label: "Buscar", href: "#buscar" },
];

export const Header = ({ onOpenLibrary, onOpenNotebookCart = () => {} }) => {
  const [open, setOpen] = useState(false);
  const { isStaff, user, role, setLoginOpen, logout } = useAuth();
  const { notebookCart } = useLibrary();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  const handleLogoClick = (e) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); setLoginOpen(true); return; }
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 800);
    if (clickCount.current >= 3) { e.preventDefault(); clickCount.current = 0; setLoginOpen(true); }
  };

  const handleLogout = async () => { await logout(); toast.success("Sesión cerrada"); };

  return (
    <header data-testid="app-header" className="fixed top-0 w-full z-40 backdrop-blur-xl bg-[#020b04]/70 border-b border-[#c9a227]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between h-16">
        <a href="#inicio" className="flex items-center gap-2.5 group select-none" data-testid="header-logo" onClick={handleLogoClick} title="Inicio">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c9a227]/40 bg-[#051a09] flex items-center justify-center shadow-[0_0_14px_rgba(201,162,39,0.16)] group-hover:shadow-[0_0_20px_rgba(201,162,39,0.3)] transition-shadow">
            <img src="/logo.png" alt="RGB" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-cinzel text-[#c9a227] text-base tracking-wider">RGB</div>
            <div className="font-dm-sans text-[9px] uppercase tracking-[0.2em] text-[#a3b3a6]">Biblioteca Escolar</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={l.href} data-testid={`nav-link-${l.id}`}
              className="font-dm-sans text-sm tracking-wide text-[#f4f1e1] hover:text-[#c9a227] transition-colors">
              {l.label}
            </a>
          ))}
          {isStaff && user && (
            <div className="hidden lg:flex items-center gap-3 pl-5 border-l border-[#c9a227]/15">
              <UserAvatar user={user} size="sm" />
              <div className="flex flex-col text-left">
                <span className="font-dm-sans text-xs text-[#f4f1e1]">{user.name}</span>
                <span className="font-dm-sans text-[10px] text-[#a3b3a6] uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
          )}
          {isStaff && (
            <button onClick={handleLogout} data-testid="header-logout-btn"
              className="btn-outline-gold inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-dm-sans font-semibold tracking-widest uppercase">
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          )}
          <button onClick={onOpenNotebookCart} data-testid="header-notebook-cart-btn" title="Carrito para NotebookLM"
            className="btn-outline-gold relative inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-dm-sans font-semibold tracking-widest uppercase">
            <ShoppingCart className="w-3.5 h-3.5" />
            Carrito
            {notebookCart.length > 0 && <span className="min-w-4 h-4 px-1 rounded-full bg-[#c9a227] text-[#020b04] text-[9px] inline-flex items-center justify-center">{notebookCart.length}</span>}
          </button>
          <button onClick={onOpenLibrary} data-testid="header-open-library-btn"
            className="btn-gold px-4 py-1.5 rounded-sm text-sm font-dm-sans font-semibold tracking-wide">
            Biblioteca
          </button>
        </nav>

        <button className="md:hidden text-[#c9a227] p-2" onClick={() => setOpen((v) => !v)} data-testid="mobile-menu-toggle" aria-label="Menú">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#c9a227]/15 bg-[#020b04]/95 px-6 py-4 flex flex-col gap-4 animate-fade-in">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={l.href} onClick={() => setOpen(false)} data-testid={`mobile-nav-link-${l.id}`}
              className="font-dm-sans text-sm text-[#f4f1e1]">
              {l.label}
            </a>
          ))}
          {isStaff && (
            <button onClick={() => { setOpen(false); handleLogout(); }}
              className="btn-outline-gold inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-dm-sans font-semibold tracking-widest uppercase">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          )}
          <button onClick={() => { setOpen(false); onOpenNotebookCart(); }} data-testid="mobile-notebook-cart-btn"
            className="btn-outline-gold inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-xs font-dm-sans font-semibold tracking-widest uppercase">
            <ShoppingCart className="w-3.5 h-3.5" /> Carrito{notebookCart.length ? ` (${notebookCart.length})` : ""}
          </button>
          <button onClick={() => { setOpen(false); onOpenLibrary(); }} data-testid="mobile-open-library-btn"
            className="btn-gold px-4 py-2 rounded-sm text-sm font-dm-sans font-semibold">
            Abrir Biblioteca
          </button>
        </div>
      )}

      {isStaff && (
        <div data-testid="staff-mode-banner"
          className="bg-[#c9a227]/15 border-t border-[#c9a227]/30 py-1.5 text-center font-dm-sans text-[10px] tracking-[0.3em] uppercase text-[#c9a227] flex items-center justify-center gap-2">
          <Shield className="w-3 h-3" />
          Modo {role} activo
        </div>
      )}
    </header>
  );
};
