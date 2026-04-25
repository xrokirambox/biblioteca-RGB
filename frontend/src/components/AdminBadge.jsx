import React, { useState } from "react";
import { Shield, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BooksManager } from "./BooksManager";

export const AdminBadge = () => {
  const { isAdmin, user, setLoginOpen } = useAuth();
  const [booksOpen, setBooksOpen] = useState(false);

  if (user === null) return null;

  if (!isAdmin) {
    return (
      <button
        onClick={() => setLoginOpen(true)}
        data-testid="discrete-admin-btn"
        title="Acceso administrador"
        aria-label="Acceso administrador"
        className="fixed bottom-5 left-5 z-30 w-9 h-9 rounded-full border border-[#c9a227]/25 bg-[#051a09]/70 backdrop-blur flex items-center justify-center text-[#c9a227]/60 hover:text-[#c9a227] hover:border-[#c9a227]/60 transition opacity-40 hover:opacity-100"
      >
        <Shield className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setBooksOpen(true)}
        data-testid="admin-books-manager-btn"
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#c9a227] text-[#020b04] font-dm-sans text-xs font-semibold tracking-widest uppercase shadow-[0_0_30px_rgba(201,162,39,0.5)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(201,162,39,0.7)] transition-all"
      >
        <BookOpen className="w-4 h-4" />
        Gestionar Libros
      </button>
      <BooksManager open={booksOpen} onClose={() => setBooksOpen(false)} />
    </>
  );
};
