'use client';

import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";

export default function UserBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Não mostra na tela inicial (login) ou se não tiver usuário
  if (!user || pathname === "/") return null;

  return (
    <div
      className="flex justify-end items-center p-4 bg-gray-100 dark:bg-gray-800 text-sm"
      style={{ position: "sticky", top: 0, zIndex: 50 }}
    >
      <span className="mr-4 text-gray-700 dark:text-gray-300">{user}</span>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
      >
        Sair
      </button>
    </div>
  );
}
