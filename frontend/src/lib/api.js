import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
const baseURL = `${backendUrl}/api`;

let csrfToken = null;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// The session is an HttpOnly cookie; only this short-lived CSRF value is held in memory.
api.interceptors.request.use((config) => {
  if (csrfToken) {
    config.headers = config.headers || {};
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

export const setCsrfToken = (token) => { csrfToken = token || null; };
