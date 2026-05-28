import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

axios.defaults.withCredentials = true;

const AuthContext = createContext(null);
const TOKEN_KEY = "rgb_staff_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anon, object = logged
  const [loginOpen, setLoginOpen] = useState(false);

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const authHeader = () => {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const fetchMe = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: authHeader() });
      setUser(res.data);
    } catch {
      setUser(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    if (res.data?.token) localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try { await axios.post(`${API}/auth/logout`, {}, { headers: authHeader() }); } catch (_) {}
    localStorage.removeItem(TOKEN_KEY);
    setUser(false);
  };

  const role = user?.role || null;
  const isAdmin = role === "admin";
  const isRector = role === "rector";
  const isStaff = isAdmin || isRector;
  // Rector cannot delete users, only admin can; both can create
  const canDeleteUsers = isAdmin;
  const canChangeRoles = isAdmin;
  const canCreateUsers = isStaff;

  const value = {
    user, role, isAdmin, isRector, isStaff,
    canDeleteUsers, canChangeRoles, canCreateUsers,
    loginOpen, setLoginOpen, login, logout, authHeader,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
