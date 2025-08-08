import React, { useState } from "react";

interface Props {
  onConfirm: (valor: number) => void;
}

const CargaLinearAlvenaria: React.FC<Props> = ({ onConfirm }) => {
  const [valor, setValor] = useState<string>("");

  const valorNumerico = Number(valor.replace(",", "."));
  const erro = valor.length > 0 && (isNaN(valorNumerico) || valorNumerico < 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!erro && valor.length > 0) {
      onConfirm(valorNumerico);
      setValor("");
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <label className="font-semibold text-cyan-900 dark:text-cyan-200 text-sm">
        Carga linear de alvenaria (kN/m)
      </label>
      <input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        className={`border rounded-lg px-3 py-2 text-base w-40
          ${erro ? "border-red-500 bg-red-50" : "border-cyan-400"}
        `}
        placeholder="Ex: 3.25"
        value={valor}
        onChange={e => setValor(e.target.value)}
        autoFocus
      />
      {erro && (
        <div className="text-xs text-red-600 font-bold">
          Digite um valor numérico positivo!
        </div>
      )}
      <button
        type="submit"
        className="bg-cyan-700 hover:bg-cyan-900 text-white rounded-lg px-4 py-1 font-bold text-sm mt-1"
        disabled={erro || valor.length === 0}
      >
        Confirmar
      </button>
    </form>
  );
};

export default CargaLinearAlvenaria;
