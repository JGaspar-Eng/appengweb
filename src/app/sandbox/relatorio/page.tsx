"use client";

import React, { useState } from "react";
import { downloadTxtReport } from "@/lib/report";

export default function RelatorioSandboxPage() {
  const [titulo, setTitulo] = useState("Relatório de Dimensionamento — Sandbox");
  const [tipo, setTipo] = useState<"biapoiada" | "continua" | "balanco">("biapoiada");
  const [trelica, setTrelica] = useState("TR12");
  const [bw, setBw] = useState(9);
  const [bf, setBf] = useState(42);
  const [h, setH] = useState(12);
  const [hf, setHf] = useState(4);
  const [d, setD] = useState(10.5);
  const [fck, setFck] = useState(30);
  const [fyk, setFyk] = useState(500);
  const [As, setAs] = useState(2.5);
  const [AsAdotada, setAsAdotada] = useState(2.83);
  const [diam, setDiam] = useState(8);
  const [qtd, setQtd] = useState(4);

  return (
    <main className="min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sandbox — Gerar Relatório .txt</h1>
      <p className="text-sm text-gray-600">
        Ferramenta simples para emitir TXT local com os dados do dimensionamento.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-medium">Entrada</h2>
          <Text label="Título" v={titulo} set={setTitulo} />
          <Select
            label="Tipo"
            v={tipo}
            set={setTipo}
            opts={[
              ["biapoiada", "Biapoiada"],
              ["continua", "Contínua"],
              ["balanco", "Balanço"],
            ]}
          />
          <Text label="Treliça" v={trelica} set={setTrelica} />
          <Num label="bw (cm)" v={bw} set={setBw} />
          <Num label="bf (cm)" v={bf} set={setBf} />
          <Num label="h (cm)" v={h} set={setH} />
          <Num label="hf (cm)" v={hf} set={setHf} />
          <Num label="d (cm)" v={d} set={setD} />
          <Num label="fck (MPa)" v={fck} set={setFck} />
          <Num label="fyk (MPa)" v={fyk} set={setFyk} />
          <Num label="As (cm²)" v={As} set={setAs} step={0.01} />
          <Num label="As adotada (cm²)" v={AsAdotada} set={setAsAdotada} step={0.01} />
          <Num label="Ø (mm)" v={diam} set={setDiam} step={0.1} />
          <Num label="qtd barras" v={qtd} set={setQtd} step={1} />
        </div>

        <div className="space-y-4">
          <h2 className="font-medium">Ações</h2>
          <button
            className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
            onClick={() =>
              downloadTxtReport({
                titulo,
                slab: { tipo, trelica, bw, bf, h, hf, d, fck, fyk },
                calc: { As, AsAdotada },
                arranjo: { diamMm: diam, qtd },
              })
            }
          >
            Baixar .txt
          </button>

          <p className="text-xs text-gray-500">
            O arquivo é baixado localmente no navegador. Você pode anexar ao seu laudo ou orçamento.
          </p>
        </div>
      </div>
    </main>
  );
}

function Num({ label, v, set, step }: any) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="number"
        value={v}
        onChange={(e) => set(parseFloat(e.target.value) || 0)}
        step={step ?? 0.1}
        className="border rounded px-2 py-1 w-full"
      />
    </div>
  );
}
function Text({ label, v, set }: any) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        value={v}
        onChange={(e) => set(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />
    </div>
  );
}
function Select({ label, v, set, opts }: any) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <select
        value={v}
        onChange={(e) => set(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      >
        {opts.map(([val, lab]: any) => (
          <option key={val} value={val}>
            {lab}
          </option>
        ))}
      </select>
    </div>
  );
}
