// src/app/components/PageHeader.tsx
"use client";
import { useAuth } from "@/components/AuthProvider";

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {user && (
        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-200 dark:bg-neutral-800">
          Logado: {user}
        </span>
      )}
    </header>
  );
}
