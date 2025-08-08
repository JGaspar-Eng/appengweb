'use client';

import { Calculator } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 bg-[var(--color-card)] dark:bg-[var(--color-card)] shadow-lg shadow-cyan-900/20 mb-8 rounded-b-3xl border border-cyan-200 dark:border-cyan-900">
      <div>
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-cyan-800 rounded-xl flex items-center justify-center">
            <Calculator className="text-white w-6 h-6" />
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-cyan-900 dark:text-cyan-100">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
