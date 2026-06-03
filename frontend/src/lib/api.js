import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
const baseURL = `${backendUrl}/api`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
