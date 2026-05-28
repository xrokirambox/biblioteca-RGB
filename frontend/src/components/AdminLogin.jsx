import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

function formatApiError(detail) {
  if (detail == null) return "Error de autenticación";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(", ");
  return String(detail);
}

export const AdminLogin = () => {
  const { loginOpen, setLoginOpen, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loginOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setLoginOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [loginOpen, setLoginOpen]);

  if (!loginOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      toast.success(`Bienvenido, ${u.name || u.email}`);
      setLoginOpen(false);
      setEmail(""); setPassword("");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Credenciales inválidas");
    } finally { setBusy(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-[#020b04]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setLoginOpen(false)} data-testid="admin-login-overlay">
      <div className="w-full max-w-md bg-[#051a09] border border-[#c9a227]/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()} data-testid="admin-login-modal">
        <div className="p-6 border-b border-[#c9a227]/20 bg-[#020b04]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#c9a227]" />
            </div>
            <div>
              <div className="font-cinzel text-[#f4f1e1] text-lg">Acceso del Personal</div>
              <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#c9a227]">Admin / Rector</div>
            </div>
          </div>
          <button onClick={() => setLoginOpen(false)} className="p-2 rounded-full hover:bg-[#c9a227]/10 text-[#c9a227] transition" data-testid="admin-login-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block font-dm-sans text-xs tracking-widest uppercase text-[#c9a227]/80 mb-2">Correo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@rgb.edu" autoFocus required
              data-testid="admin-login-email"
              className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-4 py-3 font-dm-sans text-sm text-white placeholder:text-[#a3b3a6]/50 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] transition" />
          </div>
          <div>
            <label className="block font-dm-sans text-xs tracking-widest uppercase text-[#c9a227]/80 mb-2">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
              data-testid="admin-login-password"
              className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-4 py-3 font-dm-sans text-sm text-white placeholder:text-[#a3b3a6]/50 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] transition" />
          </div>
          <button type="submit" disabled={busy} data-testid="admin-login-submit"
            className="btn-gold w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm font-dm-sans text-sm font-semibold tracking-wider uppercase disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {busy ? "Entrando..." : "Iniciar sesión"}
          </button>
          <p className="font-dm-sans text-[10px] text-[#a3b3a6]/70 text-center tracking-wide">
            Presiona <span className="text-[#c9a227]">ESC</span> para cerrar
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
};
