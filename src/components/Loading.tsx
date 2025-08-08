// src/components/Loading.tsx
"use client";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950">
      <Loader2 className="animate-spin text-cyan-400 w-16 h-16 mb-4" />
      <span className="text-neutral-200 text-lg font-semibold">Carregando...</span>
    </div>
  );
}
