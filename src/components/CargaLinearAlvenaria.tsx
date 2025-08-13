// src/components/CargaLinearAlvenaria.tsx
"use client";

import React, { useState } from "react";

interface Props {
  onConfirm: (valor: number) => void;
}

export default function CargaLinearAlvenaria({ onConfirm }: Props) {
  const [valor, setValor] = useState<string>("");

  // Aceita vírgula ou ponto; trata vazio corretamente
  const valorNumerico =
    valor === "" ? NaN : parseFloat(valor.replace(",", "."));

  const erro =
    valor !== "" && (!Number.isFinite(valorNumerico) || valorNumerico < 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!erro && valor !== "") {
      onConfirm(valorNumerico);
      setValor("");
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
      <label
        htmlFor="carga-linear-alvenaria"
        className="font-semibold text-cyan-900 dark:text-cyan-200 text-sm"
      >
        Carga linear de alvenaria (kN/m)
      </label>

      <input
        id="carga-linear-alvenaria"
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        autoComplete="off"
        className={`border rounded-lg px-3 py-2 text-base w-40 outline-none focus:ring-2
          ${erro ? "border-red-500 bg-red-50 focus:ring-red-300" : "border-cyan-400 focus:ring-cyan-300"}
        `}
        placeholder="Ex: 3.25"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          // Evita notação científica/sinais indevidos em alguns browsers
          if (["e", "E", "+"].includes(e.key)) e.preventDefault();
        }}
        aria-invalid={erro ? "true" : "false"}
        aria-describedby={erro ? "carga-erro" : undefined}
        autoFocus
      />

      {erro && (
        <div id="carga-erro" className="text-xs text-red-600 font-bold">
          Digite um valor numérico positivo!
        </div>
      )}

      <button
        type="submit"
        className="bg-cyan-700 hover:bg-cyan-900 text-white rounded-lg px-4 py-1 font-bold text-sm mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={erro || valor === ""}
      >
        Confirmar
      </button>
    </form>
  );
}
