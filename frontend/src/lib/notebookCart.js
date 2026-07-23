const STORAGE_KEY = "rgb_notebook_cart";

export const getSavedNotebookCart = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};

export const saveNotebookCart = (ids) => localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
export const clearNotebookCart = () => localStorage.removeItem(STORAGE_KEY);
