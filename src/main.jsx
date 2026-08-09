import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import "./index.css";

// Enrutado muy simple sin librerías externas: si la URL es /admin
// mostramos el panel de administración, si no, la pantalla de reserva.
const path = window.location.pathname.replace(/\/+$/, "");
const isAdmin = path === "/admin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{isAdmin ? <Admin /> : <App />}</React.StrictMode>
);
