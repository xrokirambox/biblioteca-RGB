import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAccessToken, setCsrfToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setCsrfToken(res.data?.csrf_token);
      const currentUser = { ...res.data };
      delete currentUser.csrf_token;
      setUser(currentUser);
    } catch {
      setAccessToken(null);
      setCsrfToken(null);
      setUser(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setAccessToken(res.data?.access_token);
    setCsrfToken(res.data?.csrf_token);
    const currentUser = { ...res.data };
    delete currentUser.access_token;
    delete currentUser.csrf_token;
    setUser(currentUser);
    return currentUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    setCsrfToken(null);
    setAccessToken(null);
    setUser(false);
  };

  const role = user?.role || null;
  const isAdmin = role === "admin";
  const isRector = role === "rector";
  const isTeacher = role === "docente";
  const isStaff = isAdmin || isRector;
  const canDeleteUsers = isAdmin;
  const canChangeRoles = isAdmin;
  const canCreateUsers = isStaff;

  const value = {
    user, role, isAdmin, isRector, isTeacher, isStaff,
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
