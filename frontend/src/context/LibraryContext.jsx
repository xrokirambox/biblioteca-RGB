import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [level, setLevel] = useState(0);
  const [nivelId, setNivelId] = useState(null);
  const [gradoId, setGradoId] = useState(null);
  const [hierCatId, setHierCatId] = useState(null);
  const [hierSubId, setHierSubId] = useState(null);

  const [links, setLinks] = useState({});
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [hierarchyTree, setHierarchyTree] = useState([]);
  const [hierarchyCategories, setHierarchyCategories] = useState([]);
  const [hierarchySubcategories, setHierarchySubcategories] = useState([]);
  const [hierarchyMaterias, setHierarchyMaterias] = useState([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);

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

  const refreshHierarchyTree = useCallback(async () => {
    try {
      setHierarchyLoading(true);
      const res = await api.get("/hierarchy/tree");
      setHierarchyTree(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading hierarchy tree", e);
    } finally {
      setHierarchyLoading(false);
    }
  }, []);

  const refreshHierarchyCategories = useCallback(async () => {
    try {
      const res = await api.get("/hierarchy/categories");
      setHierarchyCategories(res.data || []);
    } catch (e) {
      console.error("Error loading hierarchy categories", e);
    }
  }, []);

  const refreshHierarchySubcategories = useCallback(async () => {
    try {
      const res = await api.get("/hierarchy/subcategories");
      setHierarchySubcategories(res.data || []);
    } catch (e) {
      console.error("Error loading hierarchy subcategories", e);
    }
  }, []);

  const refreshHierarchyMaterias = useCallback(async () => {
    try {
      const res = await api.get("/hierarchy/materias");
      setHierarchyMaterias(res.data || []);
    } catch (e) {
      console.error("Error loading hierarchy materias", e);
    }
  }, []);

  useEffect(() => {
    refreshLinks();
    refreshBooks();
    refreshCategories();
    refreshHierarchyTree();
    refreshHierarchyCategories();
    refreshHierarchySubcategories();
    refreshHierarchyMaterias();
  }, [refreshLinks, refreshBooks, refreshCategories, refreshHierarchyTree, refreshHierarchyCategories, refreshHierarchySubcategories, refreshHierarchyMaterias]);

  const openModal = () => {
    setLevel(0);
    setNivelId(null);
    setGradoId(null);
    setHierCatId(null);
    setHierSubId(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setLevel(0);
    setNivelId(null);
    setGradoId(null);
    setHierCatId(null);
    setHierSubId(null);
  };

  const goToNivel = (id) => { setNivelId(id); setLevel(1); };
  const goToGrado = (id) => { setGradoId(id); setLevel(2); };
  const goBack = () => {
    if (level === 2) { setLevel(1); setGradoId(null); }
    else if (level === 1) { setLevel(0); setNivelId(null); }
  };

  const goToHierCat = (id) => { setHierCatId(id); setHierSubId(null); setLevel(1); };
  const goToHierSub = (id) => { setHierSubId(id); setLevel(2); };
  const goBackHierarchy = () => {
    if (level === 2) { setLevel(1); setHierSubId(null); }
    else if (level === 1) { setLevel(0); setHierCatId(null); }
  };

  const saveLink = async (gradoIdArg, materiaId, url) => {
    const res = await api.post("/links", { grado_id: gradoIdArg, materia_id: materiaId, url });
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

  const createHierarchyCategory = async (payload) => {
    const res = await api.post("/hierarchy/categories", payload);
    setHierarchyCategories((prev) => [...prev, res.data]);
    await refreshHierarchyTree();
    return res.data;
  };

  const updateHierarchyCategory = async (id, payload) => {
    const res = await api.put(`/hierarchy/categories/${id}`, payload);
    setHierarchyCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    await refreshHierarchyTree();
    return res.data;
  };

  const deleteHierarchyCategory = async (id) => {
    await api.delete(`/hierarchy/categories/${id}`);
    setHierarchyCategories((prev) => prev.filter((c) => c.id !== id));
    await refreshHierarchyTree();
  };

  const createSubcategory = async (payload) => {
    const res = await api.post("/hierarchy/subcategories", payload);
    setHierarchySubcategories((prev) => [...prev, res.data]);
    await refreshHierarchyTree();
    return res.data;
  };

  const updateSubcategory = async (id, payload) => {
    const res = await api.put(`/hierarchy/subcategories/${id}`, payload);
    setHierarchySubcategories((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    await refreshHierarchyTree();
    return res.data;
  };

  const deleteSubcategory = async (id) => {
    await api.delete(`/hierarchy/subcategories/${id}`);
    setHierarchySubcategories((prev) => prev.filter((s) => s.id !== id));
    await refreshHierarchyTree();
  };

  const createHierarchyMateria = async (payload) => {
    const res = await api.post("/hierarchy/materias", payload);
    setHierarchyMaterias((prev) => [...prev, res.data]);
    await refreshHierarchyTree();
    return res.data;
  };

  const updateHierarchyMateria = async (id, payload) => {
    const res = await api.put(`/hierarchy/materias/${id}`, payload);
    setHierarchyMaterias((prev) => prev.map((m) => (m.id === id ? res.data : m)));
    await refreshHierarchyTree();
    return res.data;
  };

  const deleteHierarchyMateria = async (id) => {
    await api.delete(`/hierarchy/materias/${id}`);
    setHierarchyMaterias((prev) => prev.filter((m) => m.id !== id));
    await refreshHierarchyTree();
  };

  const value = {
    modalOpen, level, nivelId, gradoId, links, books, categories, loading,
    hierarchyTree, hierarchyCategories, hierarchySubcategories, hierarchyMaterias, hierarchyLoading,
    hierCatId, hierSubId,
    openModal, closeModal, goToNivel, goToGrado, goBack,
    goToHierCat, goToHierSub, goBackHierarchy,
    saveLink, removeLink, refreshLinks,
    createBook, updateBook, deleteBook, refreshBooks,
    createCategory, updateCategory, deleteCategory, refreshCategories,
    createHierarchyCategory, updateHierarchyCategory, deleteHierarchyCategory,
    createSubcategory, updateSubcategory, deleteSubcategory,
    createHierarchyMateria, updateHierarchyMateria, deleteHierarchyMateria,
    refreshHierarchyTree, refreshHierarchyCategories, refreshHierarchySubcategories, refreshHierarchyMaterias,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
};