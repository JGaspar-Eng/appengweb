'use client';

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/app/components/PageHeader";
import Footer from "@/app/components/Footer";

export default function WelcomePage() {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await login(usuario, senha);
    } catch (err: any) {
      setErro(err.message || "Erro ao efetuar login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors relative px-8">
      <PageHeader
        title="Bem-vindo Engenheiro"
        subtitle="Gestão, cálculos, dimensionamentos e orçamentos — tudo em um só lugar."
      />

      <div className="card p-10 mt-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="E-mail"
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
          {erro && <p className="text-red-600 font-semibold text-sm">{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`bg-[var(--color-accent)] text-white font-semibold rounded-xl py-3 px-10 shadow hover:bg-opacity-90 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <Footer />
    </main>
  );
}
