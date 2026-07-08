import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import LenisScroll from "@/components/Lenis";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryProvider>
      <AuthProvider>
        <ThemeContextProvider>
          <LenisScroll />
          <App />
        </ThemeContextProvider>
      </AuthProvider>
    </QueryProvider>
  </BrowserRouter>
);