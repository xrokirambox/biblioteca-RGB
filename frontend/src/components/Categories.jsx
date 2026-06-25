import React from "react";
import { NIVELES } from "../data/niveles";
import { Sprout, BookOpenText, GraduationCap, ArrowUpRight, Users } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";

const ICONS = { Sprout, BookOpenText, GraduationCap, Users };

export const Categories = () => {
  const { openModal, goToNivel, goToCategory, categories } = useLibrary();

  const handleNivelClick = (nivelId) => {
    openModal();
    setTimeout(() => goToNivel(nivelId), 10);
  };

  const handleCategoryClick = (categoryId) => {
    openModal();
    setTimeout(() => goToCategory(categoryId), 10);
  };

  const visibleCategories = (categories || []).filter((c) => c.status === "show");

  return (
    <section id="salones" data-testid="categories-section" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-14 max-w-2xl">
          <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-3">
            Salones de Clase
          </div>
          <h2 className="font-cinzel text-4xl sm:text-5xl text-[#f4f1e1] leading-tight">
            Selecciona un <span className="text-[#c9a227] italic font-cormorant">nivel académico</span>
          </h2>
          <div className="divider-gold mt-8" />
        </div>

        {/* Niveles fijos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {NIVELES.map((nivel, idx) => {
            const Icon = ICONS[nivel.icon] || BookOpenText;
            return (
              <button
                key={nivel.id}
                onClick={() => handleNivelClick(nivel.id)}
                data-testid={`nivel-card-${nivel.id}`}
                className="group text-left glass rounded-lg p-8 relative overflow-hidden hover:border-[#c9a227]/50 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a227]/10 rounded-bl-full group-hover:bg-[#c9a227]/20 transition-colors" />
                <div className="absolute top-5 right-5 text-[#c9a227]/70 group-hover:text-[#c9a227] transition-colors">
                  <ArrowUpRight className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[#c9a227]/10 flex items-center justify-center border border-[#c9a227]/30 mb-6">
                    <Icon className="w-6 h-6 text-[#c9a227]" />
                  </div>
                  <h3 className="font-cinzel text-3xl text-[#f4f1e1] mb-2">{nivel.name}</h3>
                  <div className="font-dm-sans text-xs tracking-[0.25em] uppercase text-[#c9a227] mb-5">
                    {nivel.subtitle}
                  </div>
                  <p className="font-cormorant text-lg text-[#a3b3a6] leading-relaxed">
                    {nivel.description}
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[#c9a227]/80 font-dm-sans text-xs tracking-wider uppercase">
                    <span className="h-px w-8 bg-[#c9a227]/60" />
                    {nivel.grados.length} grados disponibles
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Categorías del admin — clicables */}
        {visibleCategories.length > 0 && (
          <div className="mt-16">
            <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-6">
              Categorías especiales
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {visibleCategories.map((category, idx) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  data-testid={`category-card-${category.id}`}
                  className="group text-left glass rounded-lg p-8 relative overflow-hidden hover:border-[#c9a227]/50 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a227]/10 rounded-bl-full group-hover:bg-[#c9a227]/20 transition-colors" />
                  <div className="absolute top-5 right-5 text-[#c9a227]/70 group-hover:text-[#c9a227] transition-colors">
                    <ArrowUpRight className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-[#c9a227]/10 flex items-center justify-center border border-[#c9a227]/30 mb-6">
                      <Users className="w-6 h-6 text-[#c9a227]" />
                    </div>
                    <h3 className="font-cinzel text-3xl text-[#f4f1e1] mb-2">{category.name}</h3>
                    <div className="font-dm-sans text-xs tracking-[0.25em] uppercase text-[#c9a227] mb-5">
                      {category.audience === "profesores" ? "Solo profesores"
                        : category.audience === "estudiantes" ? "Solo estudiantes"
                        : "General"}
                    </div>
                    <p className="font-cormorant text-lg text-[#a3b3a6] leading-relaxed min-h-[3rem]">
                      {category.description || "Categoría creada para ti "}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[#c9a227]/80 font-dm-sans text-xs tracking-wider uppercase">
                      <span className="h-px w-8 bg-[#c9a227]/60" />
                      Ver contenido
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};