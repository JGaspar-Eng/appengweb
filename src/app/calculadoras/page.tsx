'use client';

import Link from "next/link";
import { Bricks } from "lucide-react";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import Footer from "@/app/components/Footer";

// SVG Premium para Laje (mesmo que antes)
function LajeSVG() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="28" width="48" height="18" rx="5" fill="#16a34a" opacity="0.14" />
      <rect x="8" y="22" width="48" height="6" rx="2" fill="#22d3ee" />
      <rect x="20" y="10" width="24" height="12" rx="3" fill="#0ea5e9" />
      <rect x="25" y="15" width="14" height="7" rx="2" fill="#e0f2fe" />
      <rect x="15" y="46" width="34" height="5" rx="2.5" fill="#e2e8f0" />
    </svg>
  );
}

export default function CalculadorasEstruturaisPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors relative">
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-lg shadow-cyan-900/20 mb-10 rounded-b-3xl border border-cyan-200 dark:border-cyan-900">
        {/* Botão Voltar para Dashboard no canto esquerdo */}
        <Link
          href="/dashboard"
          className="px-4 py-1 rounded-full bg-cyan-50 dark:bg-neutral-800 border border-cyan-200 dark:border-cyan-800 font-semibold text-cyan-800 dark:text-cyan-100 hover:bg-cyan-100 hover:underline transition"
        >
          ← Voltar ao Dashboard
        </Link>

        {/* Título centralizado */}
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-cyan-900 dark:text-cyan-100 mx-auto">
          Calculadoras de Obra
        </h1>

        {/* ThemeSwitcher no canto direito */}
        <ThemeSwitcher />
      </header>

      <section className="w-full max-w-4xl mx-auto flex flex-col gap-10 pt-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <Link
            href="/lajes/biapoiada"
            className="group relative flex flex-col items-center rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-2xl shadow-cyan-900/20 hover:scale-[1.03] transition-all border border-cyan-100 dark:border-cyan-900 p-8"
          >
            <LajeSVG />
            <span className="text-lg font-semibold text-cyan-800 dark:text-cyan-200 mt-4">
              Laje Biapoiada
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-1 text-center">
              Dimensione lajes biapoiadas conforme a NBR 6118 com cálculo automático de armadura.
            </span>
            <span className="absolute top-5 right-7 text-[10px] px-2 py-0.5 bg-cyan-700 text-white rounded-full shadow">
              Novo
            </span>
          </Link>

          <Link
            href="/lajes/continua"
            className="group relative flex flex-col items-center rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-2xl shadow-cyan-900/20 hover:scale-[1.03] transition-all border border-cyan-100 dark:border-cyan-900 p-8"
          >
            <LajeSVG />
            <span className="text-lg font-semibold text-cyan-800 dark:text-cyan-200 mt-4">
              Laje Contínua
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-1 text-center">
              Cálculo detalhado de lajes contínuas, definição de treliças, momentos e armaduras sugeridas.
            </span>
          </Link>

          <div className="pointer-events-none opacity-60 flex flex-col items-center rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-2xl border border-cyan-100 dark:border-cyan-900 p-8">
            <LajeSVG />
            <span className="text-lg font-semibold text-cyan-800 dark:text-cyan-200 mt-4">
              Laje em Balanço
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600 mt-2 mb-1 text-center">
              Em breve: cálculo premium NBR 6118.
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
