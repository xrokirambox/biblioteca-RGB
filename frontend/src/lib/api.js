"import axios from \"axios\";

const backendUrl = process.env.REACT_APP_BACKEND_URL || \"\";
const baseURL = `${backendUrl}/api`;

const TOKEN_KEY = \"rgb_staff_token\";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    \"Content-Type\": \"application/json\",
  },
});

// Attach Bearer token automatically if present
api.interceptors.request.use((config) => {
  const token =
    (typeof localStorage !== \"undefined\" && localStorage.getItem(TOKEN_KEY)) ||
    null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const TOKEN_STORAGE_KEY = TOKEN_KEY;
"