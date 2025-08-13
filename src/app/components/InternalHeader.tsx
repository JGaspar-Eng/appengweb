"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";

type InternalHeaderProps = {
  title: string;
  showBackButton?: boolean;
  backHref?: string;
};

export default function InternalHeader({
  title,
  showBackButton = false,
  backHref = "/dashboard",
}: InternalHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5
                 bg-[var(--color-card)] shadow-lg shadow-cyan-900/20 mb-8 rounded-b-3xl
                 border border-[var(--color-accent)] backdrop-blur-md"
    >
      {/* Esquerda: Voltar (opcional) */}
      <div className="flex-shrink-0 min-w-[140px]">
        {showBackButton ? (
          <Link
            href={backHref}
            className="px-4 py-1 rounded-full bg-[var(--color-bg)] dark:bg-neutral-800
                       border border-[var(--color-accent)] font-semibold
                       text-[var(--color-text)] hover:bg-cyan-100 hover:underline transition"
          >
            ← Voltar
          </Link>
        ) : (
          <span className="block w-[1px]" />
        )}
      </div>

      {/* Centro: Título */}
      <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
        {title}
      </h1>

      {/* Direita: usuário + sair + tema */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 min-w-[140px] justify-end">
        {user && (
          <span className="hidden sm:block text-sm font-semibold text-[var(--color-text)]" title={user}>
            {user}
          </span>
        )}
        <button
          onClick={logout}
          className="px-3 sm:px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          title="Sair do sistema"
        >
          Sair
        </button>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
