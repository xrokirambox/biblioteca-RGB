import React, { useMemo, useState } from "react";
import { useLibrary } from "../context/LibraryContext";
import { CATEGORIAS } from "../data/materias";
import { ExternalLink } from "lucide-react";

export const FeaturedBooks = ({ searchQuery = "" }) => {
  const { books } = useLibrary();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((b) => {
      const matchCat = filter === "all" ? true : b.category === filter;
      const matchQ =
        !q ||
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [books, filter, searchQuery]);

  return (
    <section id="destacados" data-testid="featured-books-section" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-3">
              Colección Destacada
            </div>
            <h2 className="font-cinzel text-4xl sm:text-5xl text-[#f4f1e1] leading-tight">
              Libros <span className="text-[#c9a227] italic font-cormorant">recomendados</span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2" data-testid="category-filters">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                data-testid={`filter-${c.id}`}
                className={`px-4 py-2 rounded-full text-xs font-dm-sans tracking-wider uppercase border transition-all ${
                  filter === c.id
                    ? "bg-[#c9a227] text-[#020b04] border-[#c9a227]"
                    : "bg-transparent text-[#a3b3a6] border-[#c9a227]/25 hover:border-[#c9a227]/60 hover:text-[#f4f1e1]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-lg p-12 text-center font-cormorant text-xl text-[#a3b3a6]" data-testid="no-books-found">
            No se encontraron libros con los criterios seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((b, idx) => (
              <article
                key={b.id}
                data-testid={`book-card-${b.id}`}
                className="glass rounded-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300 animate-fade-up flex flex-col"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {b.cover ? (
                    <img
                      src={b.cover}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#051a09] flex items-center justify-center">
                      <ExternalLink className="w-10 h-10 text-[#c9a227]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020b04] via-[#020b04]/40 to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#020b04]/80 border border-[#c9a227]/30 font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]">
                    {b.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-cinzel text-lg text-[#f4f1e1] leading-tight mb-1 line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="font-cormorant text-base italic text-[#a3b3a6] mb-3">{b.author}</p>
                  <p className="font-dm-sans text-xs text-[#a3b3a6]/80 leading-relaxed line-clamp-2 mb-4 flex-1">
                    {b.description}
                  </p>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={`book-link-${b.id}`}
                    className="inline-flex items-center gap-2 font-dm-sans text-xs tracking-widest uppercase text-[#c9a227] hover:gap-3 transition-all"
                  >
                    Leer más <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
