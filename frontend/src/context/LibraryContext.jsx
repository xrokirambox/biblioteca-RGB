import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [level, setLevel] = useState(0);
  const [nivelId, setNivelId] = useState(null);
  const [gradoId, setGradoId] = useState(null);

  const [links, setLinks] = useState({});
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/links");
      setLinks(res.data || {});
    } catch (e) {
      console.error("Error loading links", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBooks = useCallback(async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data || []);
    } catch (e) {
      console.error("Error loading books", e);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (e) {
      console.error("Error loading categories", e);
    }
  }, []);

  useEffect(() => {
    refreshLinks();
    refreshBooks();
    refreshCategories();
  }, [refreshLinks, refreshBooks, refreshCategories]);

  const openModal = () => { setLevel(0); setNivelId(null); setGradoId(null); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const goToNivel = (id) => { setNivelId(id); setLevel(1); };
  const goToGrado = (id) => { setGradoId(id); setLevel(2); };
  const goBack = () => {
    if (level === 2) { setLevel(1); setGradoId(null); }
    else if (level === 1) { setLevel(0); setNivelId(null); }
  };

  // Links (staff)
  const saveLink = async (gradoIdArg, materiaId, url) => {
    const res = await api.post(\"/links\", {
      grado_id: gradoIdArg,
      materia_id: materiaId,
      url,
    });
    setLinks((prev) => ({
      ...prev,
      [gradoIdArg]: { ...(prev[gradoIdArg] || {}), [materiaId]: res.data.url },
    }));
    return res.data;
  };

  const removeLink = async (gradoIdArg, materiaId) => {
    await api.delete(`/links/${gradoIdArg}/${materiaId}`);
    setLinks((prev) => {
      const next = { ...prev };
      if (next[gradoIdArg]) {
        const copy = { ...next[gradoIdArg] };
        delete copy[materiaId];
        next[gradoIdArg] = copy;
      }
      return next;
    });
  };

  // Books (staff)
  const createBook = async (payload) => {
    const res = await api.post("/books", payload);
    setBooks((prev) => [...prev, res.data]);
    return res.data;
  };
  const updateBook = async (id, payload) => {
    const res = await api.put(`/books/${id}`, payload);
    setBooks((prev) => prev.map((b) => (b.id === id ? res.data : b)));
    return res.data;
  };
  const deleteBook = async (id) => {
    await api.delete(`/books/${id}`);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const createCategory = async (payload) => {
    const res = await api.post("/categories", payload);
    setCategories((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateCategory = async (id, payload) => {
    const res = await api.put(`/categories/${id}`, payload);
    setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res.data;
  };

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const value = {
    modalOpen, level, nivelId, gradoId, links, books, categories, loading,
    openModal, closeModal, goToNivel, goToGrado, goBack,
    saveLink, removeLink, refreshLinks,
    createBook, updateBook, deleteBook, refreshBooks,
    createCategory, updateCategory, deleteCategory, refreshCategories,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
};
