import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api`;
const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  // Navigation state for the modal
  const [modalOpen, setModalOpen] = useState(false);
  const [level, setLevel] = useState(0); // 0: Niveles, 1: Grados, 2: Materias
  const [nivelId, setNivelId] = useState(null);
  const [gradoId, setGradoId] = useState(null);

  // Links: { [gradoId]: { [materiaId]: url } }
  const [links, setLinks] = useState({});
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

  useEffect(() => {
    refreshLinks();
  }, [refreshLinks]);

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

  const saveLink = async (gradoIdArg, materiaId, url) => {
    const res = await axios.post(`${API}/links`, {
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
    await axios.delete(`${API}/links/${gradoIdArg}/${materiaId}`);
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

  const value = {
    modalOpen, level, nivelId, gradoId, links, loading,
    openModal, closeModal, goToNivel, goToGrado, goBack,
    saveLink, removeLink, refreshLinks,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
};
