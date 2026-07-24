import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import LenisScroll from "@/components/Lenis";
import App from "./App.jsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      fallbackRedirectUrl="/dashboard"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#9333ea",
          colorBackground: "#0b0f19",
          colorInputBackground: "#1e293b/60",
          colorText: "#f8fafc",
          colorTextSecondary: "#94a3b8",
          fontFamily: '"Poppins", sans-serif',
          borderRadius: "1rem",
        },
        elements: {
          card: "border border-slate-800/80 shadow-2xl backdrop-blur-2xl bg-slate-950/95 font-poppins rounded-3xl p-4",
          headerTitle: "text-slate-900 dark:text-white font-extrabold text-xl tracking-tight",
          headerSubtitle: "text-slate-500 dark:text-slate-400 text-xs font-medium",
          socialButtonsBlockButton: "bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl transition-all shadow-sm py-2.5",
          formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all py-2.5 text-sm",
          formFieldInput: "bg-slate-900/90 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white rounded-xl py-2.5 transition-all text-sm",
          footerActionLink: "text-purple-400 hover:text-purple-300 font-semibold",
          dividerLine: "bg-slate-800",
          dividerText: "text-slate-500 text-xs uppercase tracking-wider font-bold",
        },
      }}
    >
      <QueryProvider>
        <AuthProvider>
          <ThemeContextProvider>
            <LenisScroll />
            <App />
          </ThemeContextProvider>
        </AuthProvider>
      </QueryProvider>
    </ClerkProvider>
  </BrowserRouter>
);