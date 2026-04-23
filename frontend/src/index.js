import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";git add .
git commit -m "fix: remove alias @ from App import"
git push

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
