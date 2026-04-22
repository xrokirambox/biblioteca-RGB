import React from "react";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";

export const Hero = ({ onOpenLibrary }) => {
  return (
    <section
      id="inicio"
      data-testid="hero-section"
      className="relative overflow-hidden pt-32 pb-24 grain"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/35719475/pexels-photo-35719475.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020b04]/90 via-[#051a09]/85 to-[#020b04]" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c9a227]/30 bg-[#c9a227]/5 mb-8 animate-fade-up">
            <Sparkles className="w-3.5 h-3.5 text-[#c9a227]" />
            <span className="font-dm-sans text-xs tracking-[0.25em] uppercase text-[#c9a227]">
              Plataforma educativa premium
            </span>
          </div>

          <h1
            className="font-cinzel text-[#c9a227] text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Una biblioteca digital
            <br />
            <span className="text-[#f4f1e1] italic font-cormorant">para cada salón</span>
          </h1>

          <p
            className="mt-8 max-w-2xl font-cormorant text-xl sm:text-2xl text-[#a3b3a6] leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Organiza recursos educativos por nivel, grado y materia. Accede a enlaces de
            Google&nbsp;Drive desde un solo lugar, con una experiencia cinematográfica y elegante.
          </p>

          <div
            className="mt-12 flex flex-col sm:flex-row items-start gap-5 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <button
              onClick={onOpenLibrary}
              data-testid="hero-cta-primary"
              className="btn-gold group inline-flex items-center gap-3 px-8 py-4 rounded-sm font-dm-sans text-sm font-semibold tracking-wider uppercase"
            >
              <BookOpen className="w-4 h-4" />
              Explorar salones
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#destacados"
              data-testid="hero-cta-secondary"
              className="btn-outline-gold inline-flex items-center gap-3 px-8 py-4 rounded-sm font-dm-sans text-sm font-semibold tracking-wider uppercase"
            >
              Ver destacados
            </a>
          </div>

          {/* Stats */}
          <div
            className="mt-16 grid grid-cols-3 gap-6 max-w-xl animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { n: "11", l: "Grados" },
              { n: "12+", l: "Materias" },
              { n: "∞", l: "Recursos" },
            ].map((s) => (
              <div key={s.l} className="border-l border-[#c9a227]/30 pl-4">
                <div className="font-cinzel text-3xl text-[#c9a227]">{s.n}</div>
                <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#a3b3a6] mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
