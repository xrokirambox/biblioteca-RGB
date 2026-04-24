import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { authHeader } = useAuth();

  // Modal navigation state
  const [modalOpen, setModalOpen] = useState(false);
  const [level, setLevel] = useState(0);
  const [nivelId, setNivelId] = useState(null);
  const [gradoId, setGradoId] = useState(null);

  const [links, setLinks] = useState({});
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/links`);
      setLinks(res.data || {});
    } catch (e) {
      console.error("Error loading links", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBooks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/books`);
      setBooks(res.data || []);
    } catch (e) {
      console.error("Error loading books", e);
    }
  }, []);

  useEffect(() => {
    refreshLinks();
    refreshBooks();
  }, [refreshLinks, refreshBooks]);

  const openModal = () => {
    setLevel(0);
    setNivelId(null);
    setGradoId(null);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const goToNivel = (id) => { setNivelId(id); setLevel(1); };
  const goToGrado = (id) => { setGradoId(id); setLevel(2); };
  const goBack = () => {
    if (level === 2) { setLevel(1); setGradoId(null); }
    else if (level === 1) { setLevel(0); setNivelId(null); }
  };

  // Links CRUD (admin)
  const saveLink = async (gradoIdArg, materiaId, url) => {
    const res = await axios.post(
      `${API}/links`,
      { grado_id: gradoIdArg, materia_id: materiaId, url },
      { headers: authHeader() }
    );
    setLinks((prev) => ({
      ...prev,
      [gradoIdArg]: { ...(prev[gradoIdArg] || {}), [materiaId]: res.data.url },
    }));
    return res.data;
  };

  const removeLink = async (gradoIdArg, materiaId) => {
    await axios.delete(`${API}/links/${gradoIdArg}/${materiaId}`, { headers: authHeader() });
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

  // Books CRUD (admin)
  const createBook = async (payload) => {
    const res = await axios.post(`${API}/books`, payload, { headers: authHeader() });
    setBooks((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateBook = async (id, payload) => {
    const res = await axios.put(`${API}/books/${id}`, payload, { headers: authHeader() });
    setBooks((prev) => prev.map((b) => (b.id === id ? res.data : b)));
    return res.data;
  };

  const deleteBook = async (id) => {
    await axios.delete(`${API}/books/${id}`, { headers: authHeader() });
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const value = {
    modalOpen, level, nivelId, gradoId, links, books, loading,
    openModal, closeModal, goToNivel, goToGrado, goBack,
    saveLink, removeLink, refreshLinks,
    createBook, updateBook, deleteBook, refreshBooks,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
};
