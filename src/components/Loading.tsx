// src/components/Loading.tsx
"use client";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-950 transition-colors duration-300">
      <Loader2
        className="animate-spin text-cyan-600 dark:text-cyan-400 
                   w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-4 
                   opacity-0 animate-fadeIn"
        style={{ animationDelay: "0.2s" }}
      />
      <span
        className="text-neutral-800 dark:text-neutral-200 
                   text-base sm:text-lg md:text-xl font-semibold 
                   opacity-0 animate-fadeIn"
        style={{ animationDelay: "0.3s" }}
      >
        Carregando...
      </span>
    </div>
  );
}
