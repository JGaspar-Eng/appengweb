"use client";

import React, { useMemo, useState } from "react";
import SlabSketch from "@/components/SlabSketch";
import { sugerirArmadurasHomogeneas, areaBarra_cm2 } from "@/lib/armaduras";
import { downloadTxtReport } from "@/lib/report";

const FEATURE_ON = process.env.NEXT_PUBLIC_FEATURE_ARRANJO === "on";

const PADROES = {
  bw: 9,
  h: 12,
  d: 10.5,
  cover: 2.0,
  AsAlvo: 2.5,          // cm² (exemplo)
  espacMin: 2.0,        // cm
  diametros: [5, 6.3, 8, 10, 12.5], // catálogo comum
};

export default function ArmadurasSandboxPage() {
  const [bw, setBw] = useState(PADROES.bw);
  const [h, setH] = useState(PADROES.h);
  const [d, setD] = useState(PADROES.d);
  const [cover, setCover] = useState(PADROES.cover);
  const [espacMin, setEspacMin] = useState(PADROES.espacMin);
  const [AsAlvo, setAsAlvo] = useState(PADROES.AsAlvo);
  const [diamListStr, setDiamListStr] = useState(PADROES.diametros.join(","));

  const diametros = useMemo(
    () =>
      diamListStr
        .split(",")
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !Number.isNaN(n) && n > 0),
    [diamListStr]
  );

  const sugeridas = useMemo(
    () => sugerirArmadurasHomogeneas(AsAlvo, diametros, bw, cover, espacMin, 16),
    [AsAlvo, diametros, bw, cover, espacMin]
  );

  const topFits = sugeridas.filter((s) => s.cabe && s.As_cm2 >= AsAlvo).slice(0, 6);
  const topNoFits = sugeridas.filter((s) => !s.cabe && s.As_cm2 >= AsAlvo).slice(0, 3);

  const selecionada = topFits[0]; // melhor arranjo (se existir)
  const arrangement = selecionada
    ? { diamMm: selecionada.diamMm, qty: selecionada.qty }
    : undefined;

  return (
    <main className="min-h-screen p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Sandbox — Sugerir Armaduras</h1>
        <p className="text-sm text-gray-600">
          Gere arranjos que atinjam <code>As</code> alvo, com checagem automática de cabimento na nervura.
          Integra visualmente com o SVG (apenas se <code>NEXT_PUBLIC_FEATURE_ARRANJO=on</code>).
        </p>
      </header>

      {/* Controles */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="font-medium">Geometria</h2>
          <Num label="bw (cm)" v={bw} set={setBw} />
          <Num label="h (cm)" v={h} set={setH} />
          <Num label="d (cm)" v={d} set={setD} />
          <Num label="Cobrimento (cm)" v={cover} set={setCover} step={0.5} />
          <Num label="Espaçamento mínimo (cm)" v={espacMin} set={setEspacMin} step={0.5} />
        </div>

        <div className="space-y-4">
          <h2 className="font-medium">Meta de Armadura</h2>
          <Num label="As alvo (cm²)" v={AsAlvo} set={setAsAlvo} step={0.05} />
          <div>
            <label className="block text-sm font-medium">Catálogo de diâmetros (mm)</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={diamListStr}
              onChange={(e) => setDiamListStr(e.target.value)}
              placeholder="Ex.: 5, 6.3, 8, 10, 12.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separe por vírgulas. Vamos testar arranjos homogêneos com até 16 barras.
            </p>
          </div>

          <button
            className="mt-2 px-3 py-2 rounded bg-black text-white text-sm"
            onClick={() => {
              setBw(PADROES.bw);
              setH(PADROES.h);
              setD(PADROES.d);
              setCover(PADROES.cover);
              setEspacMin(PADROES.espacMin);
              setAsAlvo(PADROES.AsAlvo);
              setDiamListStr(PADROES.diametros.join(","));
            }}
          >
            Resetar padrões
          </button>
        </div>

        {/* Preview e relatório */}
        <div className="space-y-3">
          <h2 className="font-medium">Visual (SVG) + Relatório</h2>

          <div className="border rounded-xl p-4 bg-white flex justify-center">
            {FEATURE_ON ? (
              <SlabSketch
                bw={bw}
                h={h}
                d={d}
                cover={cover}
                showDimensions
                arrangement={arrangement}
              />
            ) : (
              <p className="text-sm text-gray-600">
                Ative <code>NEXT_PUBLIC_FEATURE_ARRANJO=on</code> no <code>.env.local</code> para ver o SVG
              </p>
            )}
          </div>

          <button
            className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
            onClick={() =>
              downloadTxtReport({
                titulo: "Relatório — Sugerir Armaduras (Sandbox)",
                slab: { tipo: "biapoiada", trelica: "—", bw, bf: 42, h, hf: 4, d, fck: 30, fyk: 500 },
                calc: {
                  As: AsAlvo,
                  AsAdotada: selecionada ? selecionada.As_cm2 : undefined,
                },
                arranjo: selecionada
                  ? {
                      diamMm: selecionada.diamMm,
                      qtd: selecionada.qty,
                      espacamentoCm: espacMin,
                      cabe: selecionada.cabe,
                      observacao: selecionada.cabe ? undefined : selecionada.motivoNaoCabe,
                    }
                  : { observacao: "Nenhum arranjo encontrado que atenda a As e caiba na nervura." },
              })
            }
          >
            Baixar relatório .txt
          </button>
        </div>
      </section>

      {/* Tabelas de sugestões */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuadroSugestoes
          titulo="Sugestões que CABEM (Top 6)"
          linhas={topFits}
          innerWidth={bw - 2 * cover}
          AsAlvo={AsAlvo}
        />
        <QuadroSugestoes
          titulo="Atendem As mas NÃO CABEM (Top 3)"
          linhas={topNoFits}
          innerWidth={bw - 2 * cover}
          AsAlvo={AsAlvo}
        />
      </section>
    </main>
  );
}

function Num({
  label,
  v,
  set,
  step,
}: {
  label: string;
  v: number;
  set: (n: number) => void;
  step?: number;
}) {
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

function QuadroSugestoes({
  titulo,
  linhas,
  innerWidth,
  AsAlvo,
}: {
  titulo: string;
  linhas: ReturnType<typeof sugerirArmadurasHomogeneas>;
  innerWidth: number;
  AsAlvo: number;
}) {
  return (
    <div>
      <h3 className="font-medium mb-2">{titulo}</h3>
      {linhas.length === 0 ? (
        <p className="text-sm text-gray-600">Nenhuma combinação encontrada.</p>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Arranjo</Th>
                <Th>As (cm²)</Th>
                <Th>Sobra</Th>
                <Th>Cabimento</Th>
                <Th>Largura útil</Th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((s, i) => (
                <tr key={i} className="border-t">
                  <Td>
                    {s.qty}×Ø{s.diamMm} (Aϕ={areaBarra_cm2(s.diamMm).toFixed(3)} cm²)
                  </Td>
                  <Td>{s.As_cm2.toFixed(3)}</Td>
                  <Td className={s.sobra_cm2 >= 0 ? "text-emerald-700" : "text-red-700"}>
                    {s.sobra_cm2.toFixed(3)}
                  </Td>
                  <Td className={s.cabe ? "text-emerald-700" : "text-red-700"}>
                    {s.cabe ? "Cabe" : "Não cabe"}
                    {!s.cabe && s.motivoNaoCabe ? ` — ${s.motivoNaoCabe}` : ""}
                  </Td>
                  <Td>
                    {innerWidth.toFixed(2)} cm úteis / precisa {s.larguraNecessaria_cm.toFixed(2)} cm
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Critérios: menor sobra &rarr; menos barras &rarr; menor Ø. Espaçamento mínimo = {innerWidth < 0 ? "-" : ""}{/* placeholder */}{}
      </p>
      <p className="text-xs text-gray-500">
        Dica: ajuste o <strong>espac. mínimo</strong> e o <strong>catálogo de diâmetros</strong> para explorar soluções mais econômicas.
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-3 py-2">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
