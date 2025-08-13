"use client";

import { Calculator } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useEffect, useState } from "react";

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Detecta scroll para aplicar blur/transparência
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 
      bg-[var(--color-card)] shadow-lg shadow-cyan-900/20 mb-8 rounded-b-3xl 
      border border-[var(--color-accent)]
      backdrop-blur-md transition-all duration-300
      ${scrolled ? "bg-opacity-90" : "bg-opacity-100"}
      animate-fadeIn`}
      style={{ animationDelay: "0.1s" }}
    >
      {/* Botão Voltar */}
      <div className="flex-shrink-0 min-w-[120px] flex justify-start">
        {showBackButton && (
          <button
            onClick={() => router.push("/")}
            disabled={router ? false : true}
            aria-current={router ? undefined : "page"}
            className="px-4 py-1 rounded-full bg-[var(--color-bg)] dark:bg-neutral-800 
            border border-[var(--color-accent)] font-semibold 
            text-[var(--color-text)] hover:bg-cyan-100 hover:underline transition
            animate-fadeIn"
            style={{ animationDelay: "0.2s" }}
            type="button"
          >
            ← Voltar
          </button>
        )}
      </div>

      {/* Título */}
      <div
        className="flex items-center gap-3 flex-1 justify-center min-w-0 animate-fadeIn"
        style={{ animationDelay: "0.3s" }}
      >
        <span className="w-8 h-8 bg-[var(--color-accent)] rounded-xl flex items-center justify-center flex-shrink-0">
          <Calculator className="text-white w-6 h-6" />
        </span>
        <h1
          className="text-lg sm:text-2xl font-extrabold tracking-tight text-[var(--color-text)] truncate min-w-0"
        >
          Dashboard Premium
        </h1>
      </div>

      {/* Botões à direita */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <div className="animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <ThemeSwitcher />
        </div>
        <button
          onClick={logout}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition
          animate-fadeIn"
          style={{ animationDelay: "0.5s" }}
          title="Sair do sistema"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
