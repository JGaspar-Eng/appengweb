// src/components/TabelaKSimples.tsx
"use client";

import React, { useState } from "react";

interface TabelaKSimplesProps {
  tabelaK: number[][];
  kcAtual: number; // valor Kc calculado para sugestão
  onSelecionar: (ks: number, bx: number) => void;
  ksSelecionado?: number;
  bxSelecionado?: number;
}

const TabelaKSimples: React.FC<TabelaKSimplesProps> = ({
  tabelaK,
  kcAtual,
  onSelecionar,
  ksSelecionado,
  bxSelecionado,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Encontra índice da linha mais próxima do kcAtual para sugestão
  const idxSugestao = tabelaK.reduce((acc, linha, idx) => {
    const diffAtual = Math.abs(tabelaK[acc][1] - kcAtual);
    const diffNovo = Math.abs(linha[1] - kcAtual);
    return diffNovo < diffAtual ? idx : acc;
  }, 0);

  function handleClick(idx: number) {
    setSelectedIdx(idx);
    const linha = tabelaK[idx];
    onSelecionar(linha[1], linha[8]);
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
            {tabelaK.map((linha, idx) => {
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
