"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import TabelaKSimples from "@/components/TabelaKSimples";
import {
  TRELICAS,
  CONCRETOS,
  ACOS,
  TABELA_K,
  TABELA_ACO,
  BITOLAS,
  CONCRETO_COLS,
  ACO_COLS,
  MAX_BARRAS_SAPATA
} from "@/components/constantes";

function percentual(areaFornecida: number, areaMinima: number) {
  return ((areaFornecida - areaMinima) / areaMinima) * 100;
}

// Hook de data/hora sem hydration error
function useNow() {
  const [now, setNow] = useState("");
  useEffect(() => {
    setNow(new Date().toLocaleString());
    const intv = setInterval(() => setNow(new Date().toLocaleString()), 1000);
    return () => clearInterval(intv);
  }, []);
  return now;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0 items-start">
      <label className="font-semibold text-cyan-800 dark:text-cyan-200 text-xs">{label}</label>
      {children}
    </div>
  );
}

export default function LajeBiapoiada() {
  // States do projeto
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [localObra, setLocalObra] = useState("");
  const [trelica, setTrelica] = useState("TR12");
  const [concreto, setConcreto] = useState("C30");
  const [aco, setAco] = useState("CA50");
  const [vao, setVao] = useState("3.85");
  const [carga, setCarga] = useState("5.0");
  const [linhaKSel, setLinhaKSel] = useState<any>(null);
  const [barrasSel, setBarrasSel] = useState<any>(null);

  // Dados geométricos/mecânicos
  const { bw, bf, h, hf, d } = TRELICAS[trelica];
  const fck = CONCRETOS[concreto];
  const fyk = ACOS[aco];
  const now = useNow();

  // --- Cálculos principais --- //
  let fcd = "", fyd = "", q = "", Vk = "", Mk = "", Md = "", Kc = "", x = "", secaoT = null;
  let asCalculada = "", asEfetiva = "", bx = "", ks = "";
  let opcoesBarras: any[] = [];

  if (vao && carga) {
    const l = Number(vao);
    const cargaNum = Number(carga.replace(",", "."));
    fcd = (fck / 1.4 / 10).toFixed(3);
    fyd = (fyk / 1.15 / 10).toFixed(3);
    const qValue = +(cargaNum * 0.42).toFixed(3);
    q = qValue.toFixed(3);
    const VkValue = +(qValue * l / 2).toFixed(3);
    Vk = VkValue.toFixed(3);
    const MkValue = +(qValue * Math.pow(l, 2) / 8).toFixed(3);
    Mk = MkValue.toFixed(3);
    const MdValue = +(MkValue * 1.4 * 100).toFixed(3);
    Md = MdValue.toFixed(3);
    Kc = +(bw * Math.pow(d, 2) / MdValue).toFixed(3);

    // Busca na tabela K — linha mais próxima do Kc
    const kcCol = CONCRETO_COLS[concreto];
    const acoCol = ACO_COLS[aco];
    let idxKcMaisProx = -1, menorDiff = Infinity;
    TABELA_K.forEach((linha, i) => {
      const diff = Math.abs(linha[kcCol] - Number(Kc));
      if (diff < menorDiff) {
        menorDiff = diff;
        idxKcMaisProx = i;
      }
    });
    const linhaSugerida = TABELA_K[idxKcMaisProx];
    const linhaParaCálculo = linhaKSel || linhaSugerida;
    bx = linhaParaCálculo ? linhaParaCálculo[0] : "";
    ks = linhaParaCálculo ? linhaParaCálculo[acoCol] : "";

    // Cálculo da linha neutra e verificação da seção T
    if (bx && d) {
      x = (bx * d).toFixed(3);
      secaoT = Number(x) <= 1.25 * hf; // TRUE: retangular, FALSE: T
    }

    // ARMADURA (método clássico)
    if (secaoT === true && ks && MdValue && d) {
      asCalculada = (ks * (MdValue / d)).toFixed(3);
      asEfetiva = (Number(asCalculada) - 0.4).toFixed(3);
    } else if (secaoT === false) {
      asCalculada = "";
      asEfetiva = "";
    }

    // SUGESTÃO DE BARRAS (com PROIBIDO e espaçamento)
    if (asEfetiva && Number(asEfetiva) > 0) {
      opcoesBarras = [];
      for (let diam of BITOLAS) {
        for (let n = 1; n <= 10; n++) {
          const areaTot = TABELA_ACO[diam][n - 1];
          if (!areaTot) continue;
          let local = "sobre a sapata";
          let proibido = false;
          if (MAX_BARRAS_SAPATA[diam] && n <= MAX_BARRAS_SAPATA[diam]) {
            local = "dentro da sapata";
          }
          if (MAX_BARRAS_SAPATA[diam] && n > MAX_BARRAS_SAPATA[diam] && local === "dentro da sapata") {
            proibido = true;
          }
          if (areaTot >= Number(asEfetiva) && areaTot <= Number(asEfetiva) * 2) {
            opcoesBarras.push({ n, diam, areaTot: areaTot.toFixed(3), local, proibido });
          }
        }
      }
      opcoesBarras.sort((a, b) => Number(a.areaTot) - Number(b.areaTot));
    }
  }

  // Para destacar linha da tabela K
  const kcCol = CONCRETO_COLS[concreto];
  const acoCol = ACO_COLS[aco];
  let idxKcMaisProx = -1,
    menorDiff = Infinity;
  if (Kc) {
    TABELA_K.forEach((linha, i) => {
      const diff = Math.abs(linha[kcCol] - Number(Kc));
      if (diff < menorDiff) {
        menorDiff = diff;
        idxKcMaisProx = i;
      }
    });
  }

  // Sugestão de treliça se seção T
  const trelicasDisponiveis = Object.entries(TRELICAS)
    .map(([key, val]) => ({ key, ...val }))
    .filter((t) => t.d > d)
    .sort((a, b) => a.d - b.d);
  const sugestaoTrelica = trelicasDisponiveis.length > 0 ? trelicasDisponiveis[0] : null;

  // Função para calcular espaçamento em cm para as barras escolhidas
  function getEspacamento(barrasQtd: number) {
    const base = 42; // largura da mesa, em cm (bf)
    if (barrasQtd < 2) return "-";
    const espac7 = (base - 2) / (barrasQtd - 1);
    const espac8 = (base - 2) / (barrasQtd - 1);
    return {
      espac7: Math.round(espac7 * 10) / 10,
      espac8: Math.round(espac8 * 10) / 10,
    };
  }

  // Observação dinâmica — só as barras econômicas e não proibidas
  const economicas = opcoesBarras.filter(
    (b) => percentual(Number(b.areaTot), Number(asEfetiva)) <= 30 && !b.proibido
  );
  let obsPreferencial = "";
  if (economicas.length > 0) {
    obsPreferencial = economicas
      .map((b) => `${b.n}Ø${b.diam}mm (${b.local === "dentro da sapata" ? "dentro" : "sobre"})`)
      .join(" ou ");
  } else {
    obsPreferencial = "Consulte o engenheiro estrutural para solução customizada.";
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 p-5 bg-gradient-to-tr from-slate-50 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl shadow-2xl">
      {/* TOPO: Campos do projeto e botão imprimir */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2 print:hidden">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            className="border px-2 py-1 rounded text-xs w-44"
            value={nomeProjeto}
            onChange={(e) => setNomeProjeto(e.target.value)}
            placeholder="Nome do Projeto"
          />
          <input
            type="text"
            className="border px-2 py-1 rounded text-xs w-44"
            value={localObra}
            onChange={(e) => setLocalObra(e.target.value)}
            placeholder="Local da Obra"
          />
        </div>
        <button
          className="px-3 py-1 bg-cyan-700 text-white rounded-xl font-semibold shadow hover:bg-cyan-900 text-xs transition"
          onClick={() => window.print()}
        >
          Imprimir relatório
        </button>
      </div>

      <h1 className="text-2xl font-extrabold mb-2 tracking-tight text-cyan-900 dark:text-cyan-300">
        Dimensionamento Premium — Laje Biapoiada
      </h1>

      {/* Linha de seleção: campos compactos lado a lado */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Field label="Treliça">
          <select
            className="w-28 border border-cyan-200 rounded-lg px-2 py-1 text-xs"
            value={trelica}
            onChange={(e) => {
              setTrelica(e.target.value);
              setLinhaKSel(null);
            }}
          >
            {Object.keys(TRELICAS).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Concreto">
          <select
            className="w-24 border border-cyan-200 rounded-lg px-2 py-1 text-xs"
            value={concreto}
            onChange={(e) => {
              setConcreto(e.target.value);
              setLinhaKSel(null);
            }}
          >
            {Object.keys(CONCRETOS).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Aço">
          <select
            className="w-24 border border-cyan-200 rounded-lg px-2 py-1 text-xs"
            value={aco}
            onChange={(e) => {
              setAco(e.target.value);
              setLinhaKSel(null);
            }}
          >
            {Object.keys(ACOS).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vão (m)">
          <input
            className="w-20 border border-cyan-200 rounded-lg px-2 py-1 text-xs"
            placeholder="3.85"
            value={vao}
            onChange={(e) => setVao(e.target.value)}
            type="number"
            min="0"
            step="0.001"
          />
        </Field>
        <Field label="Carga (kN/m²)">
          <input
            className="w-20 border border-cyan-200 rounded-lg px-2 py-1 text-xs"
            value={carga}
            onChange={(e) => setCarga(e.target.value)}
            type="number"
            min="0"
            step="0.001"
          />
        </Field>
      </div>

      {/* Linhas de dados */}
      <div className="flex flex-wrap gap-5 mb-2 text-base font-semibold">
        <span>
          <b>bw:</b> {bw} cm
        </span>
        <span>
          <b>bf:</b> {bf} cm
        </span>
        <span>
          <b>h:</b> {h} cm
        </span>
        <span>
          <b>hf:</b> {hf} cm
        </span>
        <span>
          <b>d:</b> {d} cm
        </span>
      </div>
      <div className="flex flex-wrap gap-5 mb-2 text-base">
        <span>
          <b>fck:</b> {fck} MPa
        </span>
        <span>
          <b>fcd:</b> {fcd} kN/cm²
        </span>
        <span>
          <b>fyk:</b> {fyk} MPa
        </span>
        <span>
          <b>fyd:</b> {fyd} kN/cm²
        </span>
      </div>
      <div className="flex flex-wrap gap-5 mb-4 text-base">
        <span>
          <b>q:</b> {q} kN/m
        </span>
        <span>
          <b>Vk:</b> {Vk} kN
        </span>
        <span>
          <b>Mk:</b> {Mk} kN·m
        </span>
        <span>
          <b>Md:</b> {Md} kN·cm
        </span>
        <span>
          <b>Kc:</b> {Kc}
        </span>
      </div>

      {/* Tabela K premium, só colunas certas */}
      {(vao && carga) && (
        <div className="overflow-auto mb-4">
          <table className="min-w-full border rounded-xl shadow text-xs">
            <thead>
              <tr className="bg-cyan-100 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100">
                <th className="border px-2">βx</th>
                <th className="border px-2">Kc {concreto}</th>
                <th className="border px-2">Ks {aco}</th>
              </tr>
            </thead>
            <tbody>
              {TABELA_K.map((linha, idx) => {
                const isSugestao = idx === idxKcMaisProx;
                const isSelecionada = linhaKSel === linha;
                let bg = "";
                if (isSelecionada) bg = "bg-green-100 dark:bg-green-800 font-bold";
                else if (isSugestao) bg = "bg-yellow-100 dark:bg-yellow-800 font-bold";
                return (
                  <tr
                    key={idx}
                    className={`${bg} transition-all duration-150 cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-950`}
                    onClick={() => {
                      setLinhaKSel(linha);
                      setBarrasSel(null);
                    }}
                  >
                    <td className="border px-2">{linha[0]}</td>
                    <td className="border px-2">{linha[CONCRETO_COLS[concreto]]}</td>
                    <td className="border px-2">{linha[ACO_COLS[aco]]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Advertência seção T */}
      {(secaoT === false && x) && (
        <div className="my-4 flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-100 rounded-lg">
          <AlertTriangle className="w-7 h-7 text-yellow-700 dark:text-yellow-200" />
          <div>
            <b>Seção T detectada – Não recomendada para lajes treliçadas</b><br />
            O cálculo indica que a linha neutra (<b>x = {x} cm</b>) ultrapassa o limite da mesa de compressão (<b>1,25 × hf = {(1.25 * hf).toFixed(3)} cm</b>), configurando seção T.
            <div className="mt-2">
              <b>Nas lajes treliçadas, o uso de seção T é antieconômico e inviável na prática.</b> Sugerimos trocar para <b>{sugestaoTrelica ? sugestaoTrelica.key : "—"}</b> (d = <b>{sugestaoTrelica ? sugestaoTrelica.d : "—"} cm</b>).
              {sugestaoTrelica && (
                <button
                  onClick={() => {
                    setTrelica(sugestaoTrelica.key);
                    setLinhaKSel(null);
                    setBarrasSel(null);
                  }}
                  className="ml-2 px-3 py-1 bg-cyan-700 text-white rounded-xl shadow hover:bg-cyan-900 transition text-xs"
                >
                  Usar treliça sugerida
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detalhes do cálculo retangular */}
      {(linhaKSel || (vao && carga && TABELA_K.length > 0)) && secaoT === true && (
        <div className="mt-2 mb-3 p-3 rounded-xl bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-200" />
          <div>
            <div>βx: {bx} | bx·d = x = {x} cm</div>
            <div>Seção T: <span className="text-green-700 dark:text-green-200 font-bold">Falsa (Retangular)</span> ({x} ≤ 1,25·hf = {(1.25 * hf).toFixed(3)} cm)</div>
            <div>As = ks × (Md/d) = {ks} × ({Md}/{d}) = <b>{asCalculada} cm²</b> | Área efetiva (As’ = As - 0,4): <b>{asEfetiva} cm²</b></div>
          </div>
        </div>
      )}

      {/* Sugestão de barras — ECONÔMICA/PROIBIDO/ESPACAMENTO */}
      {(linhaKSel || (vao && carga && TABELA_K.length > 0)) && asEfetiva && (
        <div className="mb-3">
          <h3 className="font-bold mb-2 text-cyan-900 dark:text-cyan-300 text-sm">Escolha a armadura (econômica/prática):</h3>
          <table className="min-w-max border rounded-xl shadow text-xs">
            <thead>
              <tr className="bg-cyan-100 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100">
                <th>Barras</th><th>Ø (mm)</th><th>Área fornecida (cm²)</th><th>Localização</th><th>% acima do mínimo</th><th>Espaçamento (7-8cm)</th>
              </tr>
            </thead>
            <tbody>
              {opcoesBarras.map((op, idx) => {
                const perc = percentual(Number(op.areaTot), Number(asEfetiva));
                let bg = "";
                let nota = "";
                let icon = null;
                if (op.proibido) {
                  bg = "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 font-semibold";
                  nota = "PROIBIDO";
                } else if (perc <= 30) { bg = "bg-green-100 dark:bg-green-800 font-bold"; nota = "✓ Econômica"; icon = <CheckCircle className="inline w-4 h-4 text-green-700 dark:text-green-200" />; }
                else if (perc <= 100) { bg = "bg-yellow-100 dark:bg-yellow-800"; nota = "! Excesso comercial"; icon = <AlertCircle className="inline w-4 h-4 text-yellow-700 dark:text-yellow-200" />; }
                else { bg = "bg-red-100 dark:bg-red-900"; nota = "!! Desperdício"; icon = <AlertTriangle className="inline w-4 h-4 text-red-700 dark:text-red-200" />; }
                // Espaçamento (só sugere se não proibido e for barras >1)
                let espacamento = "-";
                if (!op.proibido && op.n > 1) {
                  const { espac7, espac8 } = getEspacamento(op.n);
                  espacamento = `7cm: ${espac7}cm | 8cm: ${espac8}cm`;
                }
                return (
                  <tr
                    key={idx}
                    className={`${bg} transition-all duration-150 cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-950`}
                    onClick={() => !op.proibido && setBarrasSel(op)}
                  >
                    <td>{op.n}</td>
                    <td>{op.diam}</td>
                    <td>{op.areaTot}</td>
                    <td>{op.local}</td>
                    <td>
                      {perc.toFixed(0)}% {icon}
                      <span className="ml-1 text-xs">{nota}</span>
                    </td>
                    <td>{espacamento}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-xs mt-2 text-gray-700 dark:text-gray-200">
            <b>Nota:</b> Opte sempre pelo <span className="text-green-700 dark:text-green-200 font-bold">verde</span>. Cinza/PROIBIDO: nunca utilizar. Amarelo: excesso comercial. Vermelho: desperdício/congestionamento.
          </div>
        </div>
      )}

      {/* Desenho SVG premium da mesa da treliça */}
      {barrasSel && !barrasSel.proibido && (
        <div className="flex flex-col items-center my-4">
          <span className="mb-2 font-semibold text-xs">Desenho esquemático da mesa da treliça:</span>
          <svg width="260" height="80">
            {/* Sapata inferior da treliça */}
            <rect x="30" y="60" width="200" height="16" fill="#333" stroke="#888" rx="8" ry="8" />
            {/* Barras alinhadas */}
            {(() => {
              const N = barrasSel.n;
              const diam = barrasSel.diam;
              const xStart = 50, xEnd = 210;
              if (N === 1) {
                return (
                  <circle
                    cx={xStart + (xEnd - xStart) / 2}
                    cy={barrasSel.local === "dentro da sapata" ? 68 : 54}
                    r={diam * 1.1}
                    fill={barrasSel.local === "dentro da sapata" ? "#1976d2" : "#a21caf"}
                    stroke={barrasSel.local === "dentro da sapata" ? "white" : "black"}
                    strokeWidth={1}
                  />
                );
              }
              const spacing = (xEnd - xStart) / (N - 1);
              return [...Array(N)].map((_, i) => (
                <circle
                  key={i}
                  cx={xStart + i * spacing}
                  cy={barrasSel.local === "dentro da sapata" ? 68 : 54}
                  r={diam * 1.1}
                  fill={barrasSel.local === "dentro da sapata" ? "#1976d2" : "#a21caf"}
                  stroke={barrasSel.local === "dentro da sapata" ? "white" : "black"}
                  strokeWidth={1}
                />
              ));
            })()}
          </svg>
          <div className="mt-2 font-semibold text-cyan-900 dark:text-cyan-300 text-xs">
            Armadura escolhida: {barrasSel.n} Ø {barrasSel.diam} mm ({barrasSel.local})<br />
            Área fornecida: {barrasSel.areaTot} cm²
          </div>
          <div className="text-xs text-gray-600 mt-1 flex gap-2 items-center">
            <span className="inline-block w-4 h-4 align-middle" style={{ background: "#333" }}></span> Sapata da treliça
            <span className="inline-block w-4 h-4 align-middle rounded-full" style={{ background: "#1976d2" }}></span> Barra dentro
            <span className="inline-block w-4 h-4 align-middle rounded-full" style={{ background: "#a21caf" }}></span> Barra sobre
          </div>
        </div>
      )}

      {/* Observação automática premium (dinâmica) */}
      <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl px-3 py-2 mt-6 mb-2 text-xs">
        <b>Observação:</b> Escolha preferencial: {obsPreferencial}.
      </div>

      {/* FOOTER premium institucional */}
      <footer className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-700 text-xs flex flex-wrap items-center justify-between gap-2">
        <div>
          CREA/PR 1234567-D | Eng. Joanez Gaspar Pinto Junior | Sistema Premium
        </div>
        <div className="flex gap-2 items-center">
          <span>{now}</span>
          <span className="text-[8px] bg-cyan-800 text-white px-2 py-1 rounded">QR</span>
        </div>
      </footer>
    </div>
  );
}
