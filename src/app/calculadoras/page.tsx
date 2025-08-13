// src/app/calculadoras/page.tsx
"use client";

import Link from "next/link";
import Footer from "@/app/components/Footer";
import InternalHeader from "@/app/components/InternalHeader";

/** Ícone estilo laje com cor personalizada */
function LajeIcon({ tone = "cyan" }: { tone?: "cyan" | "emerald" | "violet" }) {
  const base =
    tone === "emerald"
      ? { a: "fill-emerald-500/20", b: "fill-emerald-400", c: "fill-emerald-600", d: "fill-emerald-50", e: "fill-slate-200" }
      : tone === "violet"
      ? { a: "fill-violet-500/20", b: "fill-violet-400", c: "fill-violet-600", d: "fill-violet-50", e: "fill-slate-200" }
      : { a: "fill-cyan-500/20", b: "fill-cyan-400", c: "fill-cyan-600", d: "fill-cyan-50", e: "fill-slate-200" };

  return (
    <svg width="48" height="48" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="28" width="48" height="18" rx="5" className={base.a} />
      <rect x="8" y="22" width="48" height="6" rx="2" className={base.b} />
      <rect x="20" y="10" width="24" height="12" rx="3" className={base.c} />
      <rect x="25" y="15" width="14" height="7" rx="2" className={base.d} />
      <rect x="15" y="46" width="34" height="5" rx="2.5" className={base.e} />
    </svg>
  );
}

/** Cor do título de acordo com o “tone” */
function titleColor(tone: "emerald" | "cyan" | "violet") {
  switch (tone) {
    case "emerald":
      return "text-emerald-700 dark:text-emerald-300";
    case "violet":
      return "text-violet-700 dark:text-violet-300";
    default:
      return "text-cyan-700 dark:text-cyan-300";
  }
}

/** Card genérico (link ou desabilitado) */
function Card({
  href,
  title,
  desc,
  tone,
  disabled = false,
}: {
  href?: string;
  title: string;
  desc: string;
  tone: "emerald" | "cyan" | "violet";
  disabled?: boolean;
}) {
  const common =
    "relative flex flex-col items-center rounded-3xl bg-[var(--color-card)] shadow-2xl shadow-cyan-900/20 " +
    "border border-cyan-100 dark:border-cyan-900 p-8 transition-all";
  const enabled =
    "group hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]";
  const disabledCls = "pointer-events-none opacity-60";

  const content = (
    <>
      <LajeIcon tone={tone} />
      <span className={`mt-4 text-lg font-semibold ${titleColor(tone)}`}>{title}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-1 text-center">
        {desc}
      </span>
    </>
  );

  return href && !disabled ? (
    <Link href={href} className={`${common} ${enabled}`}>
      {content}
    </Link>
  ) : (
    <div className={`${common} ${disabledCls}`}>{content}</div>
  );
}

export default function CalculadorasEstruturaisPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors relative">
      <InternalHeader title="Calculadoras de Obra" showBackButton backHref="/dashboard" />

      <section className="w-full max-w-4xl mx-auto flex flex-col gap-10 pt-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <Card
            href="/lajes/biapoiada"
            title="Laje Biapoiada"
            desc="Dimensionamento conforme NBR 6118, cálculo automático de armaduras."
            tone="emerald"
          />

          <Card
            href="/lajes/continua"
            title="Laje Contínua"
            desc="Análise de lajes contínuas, momentos fletores e armaduras sugeridas."
            tone="cyan"
          />

          <Card
            title="Laje em Balanço"
            desc="Em breve: cálculo premium NBR 6118."
            tone="violet"
            disabled
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
