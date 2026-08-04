import React from "react";
import { Search as SearchIcon } from "lucide-react";

export const SearchSection = ({ query = "", onSearch }) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query.trim());
    const el = document.getElementById("destacados");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="buscar" data-testid="search-section" className="py-20 relative">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="glass rounded-xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#c9a227]/10 blur-3xl" />
          <div className="relative">
            <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-3">
              Búsqueda
            </div>
            <h2 className="font-cinzel text-3xl sm:text-4xl text-[#f4f1e1] mb-2">
              Encuentra el recurso que buscas
            </h2>
            <p className="font-cormorant text-lg text-[#a3b3a6] mb-8">
              Explora por título, autor o materia y descubre nuevas lecturas.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a227]" />
                <input
                  data-testid="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => onSearch?.(e.target.value)}
                  placeholder="Buscar libros, autores, materias..."
                  className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm pl-11 pr-4 py-4 font-dm-sans text-sm text-white placeholder:text-[#a3b3a6]/60 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] transition"
                />
              </div>
              <button
                data-testid="search-submit-btn"
                type="submit"
                className="btn-gold px-8 py-4 rounded-sm font-dm-sans text-sm font-semibold tracking-wider uppercase"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
