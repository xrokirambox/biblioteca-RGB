import React, { useState } from "react";
import { Shield, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { StaffPanel } from "./StaffPanel";

export const AdminBadge = () => {
  const { isStaff, user, setLoginOpen, role } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);

  if (user === null) return null;

  if (!isStaff) {
    return (
      <button
        onClick={() => setLoginOpen(true)}
        data-testid="discrete-admin-btn"
        title="Acceso del personal"
        aria-label="Acceso del personal"
        className="fixed bottom-5 left-5 z-30 w-9 h-9 rounded-full border border-[#c9a227]/25 bg-[#051a09]/70 backdrop-blur flex items-center justify-center text-[#c9a227]/60 hover:text-[#c9a227] hover:border-[#c9a227]/60 transition opacity-40 hover:opacity-100"
      >
        <Shield className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        data-testid="open-staff-panel-btn"
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#c9a227] text-[#020b04] font-dm-sans text-xs font-semibold tracking-widest uppercase shadow-[0_0_30px_rgba(201,162,39,0.5)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(201,162,39,0.7)] transition-all"
      >
        <LayoutDashboard className="w-4 h-4" />
        Panel {role === "admin" ? "Admin" : "Rector"}
      </button>
      <StaffPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
};
