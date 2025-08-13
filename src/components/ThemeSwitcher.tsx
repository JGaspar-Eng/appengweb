"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonStar, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita mismatch de hidratação
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      className="p-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 transition 
      hover:bg-neutral-300 dark:hover:bg-neutral-700
      opacity-0 animate-fadeIn"
      style={{ animationDelay: "0.45s" }}
      title="Trocar tema"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonStar className="w-5 h-5 text-blue-600" />
      )}
    </button>
  );
}
