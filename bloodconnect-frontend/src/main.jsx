import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { AuthContextProvider } from "./context/AuthContext";

import "./index.css";
import "./styles/facebook.css";
import "./styles/layout.css";
import "./styles/global.css";
import "./styles/overrides.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </BrowserRouter>
);
