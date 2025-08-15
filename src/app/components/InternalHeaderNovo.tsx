"use client";

import Link from "next/link";
import React from "react";

type InternalHeaderNovoProps = {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
  // Slot opcional para botões/ações no lado direito
  rightArea?: React.ReactNode;
};

export default function InternalHeaderNovo({
  title = "Editor Estrutural — AMBIENTE DE TESTE",
  showBackButton = true,
  backHref = "/dashboard",
  rightArea,
}: InternalHeaderNovoProps) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4
                 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md
                 border-b border-cyan-600/40 shadow-sm"
    >
      {/* Esquerda: Voltar (opcional) */}
      <div className="min-w-[140px]">
        {showBackButton ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-cyan-50 dark:bg-neutral-800 border border-cyan-600/40
                       text-cyan-900 dark:text-cyan-100 font-semibold hover:bg-cyan-100
                       transition"
          >
            <span aria-hidden>←</span> Voltar
          </Link>
        ) : (
          <span className="block w-[1px]" />
        )}
      </div>

      {/* Centro: Título */}
      <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
        {title}
      </h1>

      {/* Direita: Área de ações do teste */}
      <div className="min-w-[140px] flex items-center justify-end gap-2">
        {rightArea}
      </div>
    </header>
  );
}
