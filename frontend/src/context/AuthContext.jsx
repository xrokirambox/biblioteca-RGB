import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAuthToken } from "../lib/api";  // FIX: importar setAuthToken

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data?.token) setAuthToken(res.data.token);  // ahora funciona
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    setAuthToken(null);
    setUser(false);
  };

  const role = user?.role || null;
  const isAdmin = role === "admin";
  const isRector = role === "rector";
  const isStaff = isAdmin || isRector;
  const canDeleteUsers = isAdmin;
  const canChangeRoles = isAdmin;
  const canCreateUsers = isStaff;

  const value = {
    user, role, isAdmin, isRector, isStaff,
    canDeleteUsers, canChangeRoles, canCreateUsers,
    loginOpen, setLoginOpen, login, logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};