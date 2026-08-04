import React, { useMemo, useState } from "react";
import { useLibrary } from "../context/LibraryContext";
import { CATEGORIAS } from "../data/materias";
import { ExternalLink, ShoppingCart, BookOpen, Search } from "lucide-react";

const normalize = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const FeaturedBooks = ({ searchQuery = "", generalBooks = [], onSearch }) => {
  const { books, notebookCart, toggleNotebookBook } = useLibrary();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = normalize(searchQuery.trim());
    const catalog = q ? [...books, ...generalBooks] : books;
    return catalog.filter((b) => {
      const matchCat = q || filter === "all" ? true : b.category === filter;
      const matchQ =
        !q ||
        normalize(b.title).includes(q) ||
        normalize(b.author).includes(q) ||
        normalize(b.category).includes(q) ||
        normalize(b.description).includes(q);
      return matchCat && matchQ;
    });
  }, [books, generalBooks, filter, searchQuery]);

  const isSearching = Boolean(searchQuery.trim());
  const suggestions = useMemo(() => {
    const values = [...books, ...generalBooks].flatMap((book) => [book.category, book.author]).filter(Boolean);
    return [...new Set(values)].slice(0, 4);
  }, [books, generalBooks]);

  return (
    <section id="destacados" data-testid="featured-books-section" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-3">
              {isSearching ? "Resultados de búsqueda" : "Colección Destacada"}
            </div>
            <h2 className="font-cinzel text-4xl sm:text-5xl text-[#f4f1e1] leading-tight">
              {isSearching ? <>Libros y <span className="text-[#c9a227] italic font-cormorant">recursos</span></> : <>Libros <span className="text-[#c9a227] italic font-cormorant">recomendados</span></>}
            </h2>
            {isSearching && <p className="mt-3 font-dm-sans text-sm text-[#a3b3a6]">Resultados para “{searchQuery.trim()}” en todo el catálogo.</p>}
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
          <div className="glass rounded-lg p-8 sm:p-12 text-center" data-testid="no-books-found">
            <div className="font-cormorant text-xl text-[#a3b3a6]">No se encontraron libros con esos criterios.</div>
            {isSearching && (
              <div className="mt-5">
                <p className="font-dm-sans text-xs text-[#a3b3a6]">Prueba una de estas sugerencias:</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} onClick={() => onSearch?.(suggestion)} className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/30 px-3 py-1.5 font-dm-sans text-[10px] uppercase tracking-wider text-[#c9a227] hover:bg-[#c9a227]/10">
                      <Search className="w-3 h-3" /> {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                  {b.cover ? <img src={b.cover} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-[#020b04] flex items-center justify-center"><BookOpen className="w-12 h-12 text-[#c9a227]/50" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020b04] via-[#020b04]/40 to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#020b04]/80 border border-[#c9a227]/30 font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]">
                    {b.isGeneral ? "General" : b.category}
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
                  <div className="flex items-center justify-between gap-3">
                  {b.url ? <a href={b.url} target="_blank" rel="noreferrer" data-testid={`book-link-${b.id}`} className="inline-flex items-center gap-2 font-dm-sans text-xs tracking-widest uppercase text-[#c9a227] hover:gap-3 transition-all">Leer más <ExternalLink className="w-3.5 h-3.5" /></a> : <span className="font-dm-sans text-[10px] tracking-widest uppercase text-[#a3b3a6]">Sin enlace</span>}
                  <button onClick={() => toggleNotebookBook(b.id)} data-testid={`featured-notebook-cart-toggle-${b.id}`}
                    title={notebookCart.includes(b.id) ? "Quitar del carrito" : "Añadir al carrito"}
                    className={`p-2 rounded-sm border transition ${notebookCart.includes(b.id) ? "border-[#c9a227] bg-[#c9a227] text-[#020b04]" : "border-[#c9a227]/40 text-[#c9a227] hover:bg-[#c9a227]/10"}`}>
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
