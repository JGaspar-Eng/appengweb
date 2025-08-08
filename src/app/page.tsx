'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function WelcomePage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (usuario === "gaspar@simettria.com" && senha === "desenvolvedor123") {
      document.cookie = "user=authenticated; path=/; max-age=3600"; // seta cookie
      router.push("/dashboard");
    } else {
      setErro("Usuário ou senha incorretos.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors relative px-8">
      {/* Header fixo no topo */}
      <Header
        title="Bem-vindo Engenheiro"
        subtitle="Gestão, cálculos, dimensionamentos e orçamentos — tudo em um só lugar."
      />

      {/* Formulário de login */}
      <div className="card p-10 mt-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-[var(--color-text)] bg-[var(--color-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition"
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-[var(--color-text)] bg-[var(--color-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition"
            required
            autoComplete="current-password"
          />
          {erro && (
            <p className="text-red-600 font-semibold text-sm">{erro}</p>
          )}
          <button
            type="submit"
            className="bg-[var(--color-accent)] text-white font-semibold rounded-xl py-3 px-10 shadow hover:bg-opacity-90 transition"
          >
            Entrar
          </button>
        </form>
      </div>

      <Footer />
    </main>
  );
}
