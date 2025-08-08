// src/app/restricted/page.tsx
"use client";
import { Lock, LogIn } from "lucide-react";
import Link from "next/link";

export default function RestrictedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-neutral-900 to-neutral-700 dark:from-black dark:to-neutral-900 transition-colors">
      <div className="bg-white dark:bg-neutral-950 shadow-xl rounded-2xl p-8 flex flex-col items-center gap-6 max-w-sm w-full animate-fade-in">
        <Lock className="w-12 h-12 text-red-600 dark:text-red-400 drop-shadow-lg" />
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 text-center">
          Acesso restrito
        </h2>
        <p className="text-base text-neutral-600 dark:text-neutral-300 text-center">
          Você precisa estar autenticado para acessar esta área.<br />
          Faça login para continuar.
        </p>
        <Link
          href="/login"
          className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-700 hover:scale-105 transition-transform shadow-md hover:shadow-lg"
        >
          <LogIn className="w-5 h-5" />
          Fazer login
        </Link>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(.68,-0.55,.27,1.55);
        }
      `}</style>
    </div>
  );
}
