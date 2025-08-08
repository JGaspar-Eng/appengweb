'use client';

import Link from "next/link";
import { Calculator } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import { useRouter } from "next/navigation";

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-lg shadow-cyan-900/20 mb-8 rounded-b-3xl border border-cyan-200 dark:border-cyan-900">
      
      {showBackButton ? (
        <button
          onClick={() => router.push("/")}
          className="px-4 py-1 rounded-full bg-cyan-50 dark:bg-neutral-800 border border-cyan-200 dark:border-cyan-800 font-semibold text-cyan-800 dark:text-cyan-100 hover:bg-cyan-100 hover:underline transition"
          type="button"
        >
          ← Voltar ao Início
        </button>
      ) : (
        <div style={{ width: 112 }} /> {/* Espaço reservado para alinhar */}
      )}

      <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
        <span className="w-8 h-8 bg-cyan-800 rounded-xl mr-2 flex items-center justify-center flex-shrink-0">
          <Calculator className="text-white w-6 h-6" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-cyan-900 dark:text-cyan-100 truncate min-w-0">
          Dashboard Premium
        </h1>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <ThemeSwitcher />
        <Link
          href="/logout"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          title="Sair do sistema"
        >
          Sair
        </Link>
      </div>
    </header>
  );
}
