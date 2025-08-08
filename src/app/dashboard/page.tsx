'use client';

import Link from "next/link";
import { Calculator, Building2 } from "lucide-react";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import Footer from "@/app/components/Footer";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors relative">
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-lg shadow-cyan-900/20 mb-12 rounded-b-3xl border border-cyan-200 dark:border-cyan-900">
        {/* Botão Voltar para Home no canto esquerdo */}
        <Link
          href="/"
          className="px-4 py-1 rounded-full bg-cyan-50 dark:bg-neutral-800 border border-cyan-200 dark:border-cyan-800 font-semibold text-cyan-800 dark:text-cyan-100 hover:bg-cyan-100 hover:underline transition"
        >
          ← Voltar ao Início
        </Link>

        {/* Título centralizado */}
        <h1 className="text-2xl font-extrabold tracking-tight text-cyan-900 dark:text-cyan-100">
          AppEngWeb
        </h1>

        {/* ThemeSwitcher no canto direito */}
        <ThemeSwitcher />
      </header>

      <section className="w-full max-w-4xl mx-auto flex flex-col gap-10 pt-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Link
            href="/calculadoras"
            className="group flex flex-col items-center rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-xl hover:scale-105 transition-all border border-cyan-100 dark:border-cyan-900 p-8"
          >
            <Calculator className="w-10 h-10 text-green-600 group-hover:text-green-800 mb-2" />
            <span className="text-lg font-semibold text-green-800 dark:text-green-300">
              Calculadoras de Obra
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              cálculo de materiais, orçamentos, concreto, pilares, vigas, lajes e mais.
            </span>
          </Link>

          <div className="pointer-events-none opacity-60 flex flex-col items-center rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-xl border border-cyan-100 dark:border-cyan-900 p-8">
            <Building2 className="w-10 h-10 text-purple-500 mb-2" />
            <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              Módulo Futuro
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-center">
              Em breve: projetos, relatórios, DRCB, ART digital e integrações premium.
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
