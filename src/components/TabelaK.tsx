import React, { useState } from "react";
import { TABELA_K, LinhaTabelaK } from "./constantes";

interface TabelaKProps {
  kcArr: number[];
  onSelecionar: (idxMomento: number, ks: number, bx: number) => void;
  dadosSelecionados: { ks?: number; bx?: number }[];
}

function findClosestIdx(kc: number): number {
  let closest = 0;
  let minDiff = Math.abs(TABELA_K[0][0] - kc);
  for (let i = 1; i < TABELA_K.length; i++) {
    let diff = Math.abs(TABELA_K[i][0] - kc);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
}

const TabelaK: React.FC<TabelaKProps> = ({ kcArr, onSelecionar, dadosSelecionados }) => {
  const [selected, setSelected] = useState<(number | null)[]>([null, null, null]);

  function handleClick(idxMomento: number, idxLinha: number) {
    setSelected((prev) => {
      const novo = [...prev];
      novo[idxMomento] = idxLinha;
      return novo;
    });
    const linha = TABELA_K[idxLinha];
    const ks = linha[1];
    const bx = linha[8] ?? 0;
    onSelecionar(idxMomento, ks, bx);
  }

  return (
    <div className="mt-6 mb-4">
      <h3 className="font-bold text-cyan-800 dark:text-cyan-200 text-base mb-2">
        Tabela K – selecione o par <b>ks / bx</b> para cada momento
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {kcArr.map((kc, idxMomento) => {
          const idxSugestao = findClosestIdx(Number(kc));
          return (
            <div key={idxMomento} className="rounded-xl shadow border bg-white dark:bg-neutral-900 p-2">
              <div className="mb-1 text-xs">
                <b>Momento {idxMomento + 1}:</b> Kc = <span className="text-cyan-700 font-mono">{kc}</span>
              </div>
              <div className="overflow-x-auto max-h-56">
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
                    {TABELA_K.map((linha, idxLinha) => {
                      const isSugestao = idxLinha === idxSugestao;
                      const isSelecionado = selected[idxMomento] === idxLinha;
                      return (
                        <tr
                          key={idxLinha}
                          className={
                            (isSelecionado
                              ? "bg-cyan-100 dark:bg-cyan-900 font-bold ring-2 ring-cyan-600"
                              : isSugestao
                              ? "bg-yellow-50 dark:bg-yellow-900/30"
                              : "") +
                            " transition-all duration-150"
                          }
                          style={{ cursor: "pointer" }}
                          onClick={() => handleClick(idxMomento, idxLinha)}
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
                <b>Selecionado:</b> ks = <b>{dadosSelecionados[idxMomento]?.ks ?? "-"}</b>, bx = <b>{dadosSelecionados[idxMomento]?.bx ?? "-"}</b>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabelaK;
