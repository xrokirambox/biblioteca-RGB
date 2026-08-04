import React, { useMemo, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider, useLibrary } from "./context/LibraryContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SearchSection } from "./components/SearchSection";
import { Categories } from "./components/Categories";
import { FeaturedBooks } from "./components/FeaturedBooks";
import { CTABanner } from "./components/CTABanner";
import { Footer } from "./components/Footer";
import { LibraryModal } from "./components/LibraryModal";
import { AdminLogin } from "./components/AdminLogin";
import { AdminBadge } from "./components/AdminBadge";
import { NotebookCart } from "./components/NotebookCart";

const HomeInner = () => {
  const { openModal, books, hierarchyMaterias, notebookCart, toggleNotebookBook, notebookCartOpen, setNotebookCartOpen, setNotebookCart } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const generalBooks = useMemo(() => (
    (hierarchyMaterias || [])
      .filter((materia) => !materia.content_type || materia.content_type === "book")
      .map((materia) => ({
        id: `general-${materia.id}`,
        title: materia.name,
        author: "Material general",
        category: materia.category || "general",
        cover: materia.cover || "",
        url: materia.url || "",
        description: materia.description || "Recurso general de la biblioteca.",
        isGeneral: true,
      }))
  ), [hierarchyMaterias]);

  return (
    <div className="App relative">
      <Header onOpenLibrary={openModal} onOpenNotebookCart={() => setNotebookCartOpen(true)} />
      <main>
        <Hero onOpenLibrary={openModal} />
        <SearchSection query={searchQuery} onSearch={setSearchQuery} />
        <Categories />
        <FeaturedBooks searchQuery={searchQuery} generalBooks={generalBooks} onSearch={setSearchQuery} />
        <CTABanner onOpenLibrary={openModal} />
      </main>
      <Footer />
      <LibraryModal />
      <AdminLogin />
      <AdminBadge />
      {notebookCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Carrito de NotebookLM">
          <div className="max-w-3xl mx-auto mt-12">
            <NotebookCart
              books={books}
              selectedIds={notebookCart}
              onRemove={toggleNotebookBook}
              onClose={() => setNotebookCartOpen(false)}
              onPublish={() => { setNotebookCart([]); setNotebookCartOpen(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#051a09",
              color: "#f4f1e1",
              border: "1px solid rgba(201,162,39,0.3)",
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeInner />} />
          </Routes>
        </BrowserRouter>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
