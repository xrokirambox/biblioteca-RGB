import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <LibraryProvider>
        <App />
      </LibraryProvider>
    </AuthProvider>
  </React.StrictMode>
);