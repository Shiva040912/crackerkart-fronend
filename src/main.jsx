import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./styles/theme.css";
import "./styles/admin-theme.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <App />
      <Toaster position="top-right" />
    </GoogleOAuthProvider>
  </StrictMode>
);