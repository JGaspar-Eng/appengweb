"use client";

import React, { useState } from "react";
import { TABELA_K } from "@/components/constantes";

interface TabelaKSimplesProps {
  kcAtual: number; // valor Kc calculado para sugestão
  onSelecionar: (ks: number, bx: number) => void;
  ksSelecionado?: number;
  bxSelecionado?: number;
}

const TabelaKSimples: React.FC<TabelaKSimplesProps> = ({
  kcAtual,
  onSelecionar,
  ksSelecionado,
  bxSelecionado,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!TABELA_K || !Array.isArray(TABELA_K) || TABELA_K.length === 0) {
    return (
      <div className="p-4 border rounded text-red-500">
        ⚠ Nenhum dado disponível para a Tabela K.
      </div>
    );
  }

  // Sugestão baseada no Kc (coluna 0)
  const kcNum = Number(kcAtual);
  const idxSugestao = Number.isFinite(kcNum)
    ? TABELA_K.reduce((acc, linha, idx) => {
        const diffAtual = Math.abs(TABELA_K[acc][0] - kcNum);
        const diffNovo = Math.abs(linha[0] - kcNum);
        return diffNovo < diffAtual ? idx : acc;
      }, 0)
    : 0;

  function handleClick(idx: number) {
    setSelectedIdx(idx);
    const linha = TABELA_K[idx];
    onSelecionar(linha[1], linha[8] ?? 0); // ks (1), bx (8)
  }

  return (
    <div className="mt-6 mb-4 max-w-md">
      <h3 className="font-bold text-cyan-800 dark:text-cyan-200 text-base mb-2">
        Tabela K – selecione o par <b>ks / bx</b>
      </h3>
      <div className="overflow-x-auto max-h-72 border rounded shadow">
        <table className="text-xs w-full border-collapse">
          <thead>
            <tr className="bg-cyan-50 dark:bg-neutral-800">
              <th className="border px-2 py-1">Kc</th>
              <th className="border px-2 py-1">ks</th>
              <th className="border px-2 py-1">bx</th>
              <th className="border px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {TABELA_K.map((linha, idx) => {
              const isSugestao = idx === idxSugestao;
              const isSelecionado = idx === selectedIdx;
              return (
                <tr
                  key={idx}
                  className={
                    (isSelecionado
                      ? "bg-cyan-100 dark:bg-cyan-900 font-bold ring-2 ring-cyan-600"
                      : isSugestao
                      ? "bg-yellow-50 dark:bg-yellow-900/30"
                      : "") + " transition-all duration-150 cursor-pointer"
                  }
                  onClick={() => handleClick(idx)}
                >
                  <td className="border px-2 py-1 font-mono">{linha[0]}</td>
                  <td className="border px-2 py-1 font-mono">{linha[1]}</td>
                  <td className="border px-2 py-1 font-mono">{linha[8]}</td>
                  <td className="border px-2 py-1">
                    {isSelecionado ? (
                      <span className="text-cyan-700 font-bold">&#10003;</span>
                    ) : isSugestao ? (
                      <span className="text-yellow-600 font-bold">Sug</span>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
        <b>Selecionado:</b> ks = <b>{ksSelecionado ?? "-"}</b>, bx = <b>{bxSelecionado ?? "-"}</b>
      </div>
    </div>
  );
};

export default TabelaKSimples;
