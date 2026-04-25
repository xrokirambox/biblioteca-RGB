import React from "react";
import { Library, Github, Mail, BookMarked } from "lucide-react";

export const Footer = () => {
  return (
    <footer data-testid="app-footer" className="relative border-t border-[#c9a227]/15 mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full border border-[#c9a227]/50 bg-[#051a09] flex items-center justify-center">
              <Library className="w-5 h-5 text-[#c9a227]" />
            </div>
            <div>
              <div className="font-cinzel text-[#c9a227] text-lg tracking-wider">RGB</div>
              <div className="font-dm-sans text-[10px] uppercase tracking-[0.2em] text-[#a3b3a6]">
                Biblioteca Escolar
              </div>
            </div>
          </div>
          <p className="font-cormorant text-lg text-[#a3b3a6] leading-relaxed max-w-md">
            Plataforma educativa digital diseñada para organizar recursos académicos por nivel,
            grado y materia con una experiencia visual premium.
          </p>
        </div>

        <div>
          <h4 className="font-cinzel text-[#c9a227] text-sm tracking-widest uppercase mb-5">Navegación</h4>
          <ul className="space-y-3 font-dm-sans text-sm text-[#a3b3a6]">
            <li><a href="#inicio" className="hover:text-[#c9a227] transition">Inicio</a></li>
            <li><a href="#salones" className="hover:text-[#c9a227] transition">Salones</a></li>
            <li><a href="#destacados" className="hover:text-[#c9a227] transition">Destacados</a></li>
            <li><a href="#buscar" className="hover:text-[#c9a227] transition">Buscar</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-cinzel text-[#c9a227] text-sm tracking-widest uppercase mb-5">Contacto</h4>
          <ul className="space-y-3 font-dm-sans text-sm text-[#a3b3a6]">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> classroom@rgb.edu.co</li>
            <li className="flex items-center gap-2"><BookMarked className="w-4 h-4" /> Recursos educativos</li>
            <li className="flex items-center gap-2"><Github className="w-4 h-4" /> xrokirambox</li>
          </ul>
        </div>
      </div>

      <div className="divider-gold" />
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#a3b3a6] font-dm-sans text-xs">
        <div>© {new Date().getFullYear()} Biblioteca Escolar RGB. Todos los derechos reservados(julian guardiola).</div>
        <div className="tracking-widest uppercase">Hecho a la medida</div>
      </div>
    </footer>
  );
};
