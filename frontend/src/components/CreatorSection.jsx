import React from "react";
import { Code2, Database, ExternalLink, Github, GraduationCap, Mail, Network, ShieldCheck } from "lucide-react";

// Attribution is intentionally source-defined rather than admin-configurable.
// It remains visible to all visitors and cannot be removed from the CMS.
const PROJECT_FEATURES = [
  { icon: Database, title: "Catálogo dinámico", text: "Libros, categorías y recursos administrables desde un panel protegido." },
  { icon: Network, title: "Ruta académica", text: "Organización por categorías, subcategorías y materiales generales." },
  { icon: Code2, title: "Recursos integrados", text: "Visualización de videos y PDFs embebidos sin duplicar enlaces." },
  { icon: ShieldCheck, title: "Gestión segura", text: "Accesos por rol, auditoría de cambios y una experiencia responsive." },
];

export const CreatorSection = () => (
  <section id="creador" data-testid="creator-section" className="py-20 sm:py-24 relative overflow-hidden border-y border-[#c9a227]/10 bg-[#051a09]/35">
    <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#c9a227]/10 blur-3xl" />
    <div className="absolute -right-28 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
    <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-16 items-start">
        <div>
          <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-3">Creado por</div>
          <h2 className="font-cinzel text-3xl sm:text-5xl leading-tight text-[#f4f1e1]">
            Julian Guardiola <span className="text-[#c9a227] italic font-cormorant">Suarez</span>
          </h2>
          <p className="mt-5 max-w-2xl font-cormorant text-lg sm:text-xl leading-relaxed text-[#a3b3a6]">
            Ingeniero de Sistemas en formación, desarrollador Full Stack y profesional de redes. Este proyecto fue diseñado para convertir recursos educativos dispersos en una biblioteca escolar clara, visual y fácil de administrar.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c9a227]/25 bg-[#020b04]/50 px-4 py-2 font-dm-sans text-xs tracking-wider text-[#f4f1e1]">
            <GraduationCap className="w-4 h-4 text-[#c9a227]" /> Universidad del Magdalena · Ingeniería en Sistemas
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="mailto:julian29082003@gmail.com" className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase">
              <Mail className="w-4 h-4" /> Contactar
            </a>
            <a href="https://github.com/xrokirambox" target="_blank" rel="noreferrer" className="btn-outline-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase">
              <Github className="w-4 h-4" /> GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="glass rounded-xl border border-[#c9a227]/20 p-5 sm:p-7">
          <div className="font-cinzel text-xl text-[#f4f1e1]">Biblioteca Escolar RGB</div>
          <p className="mt-2 font-dm-sans text-sm leading-relaxed text-[#a3b3a6]">Proyecto de biblioteca digital institucional.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROJECT_FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-white/5 bg-black/20 p-4">
                <Icon className="w-5 h-5 text-[#c9a227]" />
                <h3 className="mt-3 font-dm-sans text-sm text-[#f4f1e1]">{title}</h3>
                <p className="mt-1 font-dm-sans text-xs leading-relaxed text-[#a3b3a6]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
