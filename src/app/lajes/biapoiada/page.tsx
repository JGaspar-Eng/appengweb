// src/app/lajes/biapoiada/page.tsx

// ======================================================================
// [SECTION] Imports
// ======================================================================
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import InternalHeader from "@/app/components/InternalHeader";
import Footer from "@/app/components/Footer";
import {
  TRELICAS,
  CONCRETOS,
  ACOS,
  TABELA_K,
  TABELA_ACO,
  DIAMETROS_PADRAO,
  findClosestIdxByKc,
} from "@/components/constantes";

// ======================================================================
// [SECTION] Utilitários (Funções auxiliares, tipos, helpers)
// ======================================================================
const num = (v?: number, d = 3) =>
  Number.isFinite(v as number) ? (v as number).toFixed(d) : "–";

type KeyOf<T> = Extract<keyof T, string>;

// colunas fixas da TABELA_K (mantidas do seu arquivo)
const COL_CONCRETO: Record<KeyOf<typeof CONCRETOS>, number> = {
  C20: 1,
  C25: 2,
  C30: 3,
  C35: 4,
  C40: 5,
  C45: 6,
  C50: 7,
};
const COL_ACO: Record<KeyOf<typeof ACOS>, number> = {
  CA25: 8,
  CA50: 9,
  CA60: 10,
};
const getBx = (row: number[]) => row[0];
const getKc = (row: number[], c: KeyOf<typeof CONCRETOS>) =>
  row[COL_CONCRETO[c]] ?? null;
const getKs = (row: number[], s: KeyOf<typeof ACOS>) =>
  (row[COL_ACO[s]] ?? null) as number | null;

// tipo auxiliar para acessar os campos extras que você incluiu nas treliças
type TreExt = {
  bw: number;
  bf: number;
  h: number; // total (mesa + treliça + cobrimentos) conforme seu constantes
  hf: number;
  d: number;
  h_trelica_cm?: number;
  arm?: {
    top_mm: number;
    diag_mm: number;
    base_mm: number;
  };
};

// comprimento necessário para acomodar n barras φ com espaçamento livre s_min
const L_ocupado_cm = (n: number, phi_cm: number, smin_cm: number) =>
  n * phi_cm + (n - 1) * smin_cm;

// largura “dentro da mesa”: entre as duas barras da base + cobrimentos
const larguraUtilDentro = (
  tre: TreExt,
  c_inf_cm: number,
  phi_base_cm: number
) => tre.bw - 2 * c_inf_cm - 2 * phi_base_cm;

// área geométrica de uma bitola (cm²)
const areaBitola = (diam_mm: number) =>
  (Math.PI * (diam_mm / 10) ** 2) / 4.0;

// pequeno helper para montar “1Ø12,5”
const descArranjo = (n: number, diam: number) => `${n}Ø${diam}`;

type Sugestao = {
  n: number;
  diam: number;
  area: number; // cm²
  sobra: number; // area - AsNec
  cabe: boolean;
  L: number; // cm
};

// valor fixo de agregado (menu removido — usamos este valor)
const D_AGG_DEFAULT = 19;

// ======================================================================
// [SECTION] Componente principal (LajeBiapoiadaPage)
// ======================================================================
export default function LajeBiapoiadaPage() {
  // ------------------------------------------------------------------
  // [SUB-SECTION] Estados do componente (useState)
  // ------------------------------------------------------------------
  // escolhas padrão
  const [trelicaKey, setTrelicaKey] =
    useState<KeyOf<typeof TRELICAS>>("TR12645");
  const [concretoKey, setConcretoKey] =
    useState<KeyOf<typeof CONCRETOS>>("C30");
  const [acoKey, setAcoKey] = useState<KeyOf<typeof ACOS>>("CA50");

  // Lx x Ly -> menor vão L
  const [Lx, setLx] = useState(5.3);
  const [Ly, setLy] = useState(3.85);
  const [L, setL] = useState(3.85);

  // carga superficial característica (variável + permanentes “não PP da LT”)
  const [qBase, setQBase] = useState(5); // kN/m² (editável)
  const [usarPP, setUsarPP] = useState(true);

  // **REMOVIDO**: menu de agregados (usamos D_AGG_DEFAULT)

  // linha da tabela K
  const [kIdxEscolhido, setKIdxEscolhido] = useState<number | null>(null);

  // escolha de arranjo
  const [selN, setSelN] = useState<number | null>(null);
  const [selDiam, setSelDiam] = useState<number | null>(null);

  // PDF
  const arranjoRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // [SUB-SECTION] Cálculos e efeitos
  // ------------------------------------------------------------------
  // quando Lx/Ly mudam, define L = menor
  useEffect(() => setL(Math.min(Lx, Ly)), [Lx, Ly]);

  const menorVao: "Lx" | "Ly" | null =
    !isFinite(Lx) || !isFinite(Ly) ? null : Lx <= Ly ? "Lx" : "Ly";

  // dados auxiliares
  const tre: TreExt = TRELICAS[trelicaKey] as any;
  const conc = CONCRETOS[concretoKey];
  const aco = ACOS[acoKey];

  // largura tributária (m) -> mesmo critério seu (bf/100)
  const bf_m = tre.bf / 100;

  // estimativa simples de PP da LT (desligável):
  // PP = γ * [ capa(hf) + fração de nervura por m² ],
  // fração_nerv = (bw*(h-hf)/10000) / bf_m
  const gamma_conc = 25; // kN/m³
  const capa_m = tre.hf / 100; // m
  const nerv_m =
    (tre.bw * Math.max(0, tre.h - tre.hf) /*cm²*/ / 10000) / bf_m; // m
  const PP_kN_m2 = gamma_conc * (capa_m + nerv_m); // kN/m²

  const qTotal_kN_m2 = usarPP ? qBase + PP_kN_m2 : qBase;

  // carga por metro de nervura
  const qLinha = qTotal_kN_m2 * bf_m; // kN/m

  // esforços
  const Vk = (qLinha * L) / 2; // kN
  const Mk_kNm = (qLinha * L * L) / 8; // kN·m
  const Md_kNcm = Mk_kNm * 1.4 * 100; // ELU + conversão

  // parâmetro do professor: Kc = (bw*d²)/Md
  const Kc = (tre.bw * tre.d * tre.d) / Md_kNcm;

  const kIdxSugerido = useMemo(() => findClosestIdxByKc(Kc), [Kc]);
  const linha = kIdxEscolhido != null ? TABELA_K[kIdxEscolhido] : null;

  // Bx, ks, x, verificação T
  const Bx = linha ? getBx(linha) : undefined;
  const ks = linha ? getKs(linha, acoKey) : undefined;
  const x = Bx != null ? Bx * tre.d : undefined;
  const ehT = x != null ? x > 1.25 * tre.hf : undefined;

  // área de aço (método ks) – desconto 0,40 da treliça
  const As = ks != null ? (ks * Md_kNcm) / tre.d : undefined;
  const AsAdotar =
    As != null ? Math.max(As - 0.4 /*cm²*/, 0) : undefined;

  // ------------------- Normativa: s_min -------------------
  // s_min = max(phi, 2, 1,2 * dAgg) — usa valor fixo D_AGG_DEFAULT
  const sminFromPhi = (phi_cm: number) =>
    Math.max(phi_cm, 2.0, (1.2 * D_AGG_DEFAULT) / 10); // cm

  // larguras disponíveis (apenas "dentro")
  const phiBase_cm = (tre.arm?.base_mm ?? 5) / 10;
  const larguraDentro_cm = larguraUtilDentro(tre, 1.5, phiBase_cm); // c_inf = 1,5 cm

  // gera candidatas de arranjos com base nos diâmetros padrão e 1..10 barras
  const candidatas: { n: number; diam: number; area: number }[] = useMemo(() => {
    const out: { n: number; diam: number; area: number }[] = [];
    for (const diam of DIAMETROS_PADRAO) {
      const areas = TABELA_ACO[diam]; // [1 barra, 2 barras, ...]
      areas.forEach((a, i) => {
        out.push({ n: i + 1, diam, area: a });
      });
    }
    return out;
  }, []);

  // classifica candidatas para “dentro” e “AsAdotar”
  const { cabem, naoCabem } = useMemo(() => {
    const resultCabem: Sugestao[] = [];
    const resultNao: Sugestao[] = [];

    if (AsAdotar == null) return { cabem: resultCabem, naoCabem: resultNao };

    // sempre usar largura dentro
    const largura = larguraDentro_cm;

    for (const c of candidatas) {
      if (c.area < AsAdotar - 1e-9) continue; // só ≥ AsNec
      const phi_cm = c.diam / 10;
      const smin = sminFromPhi(phi_cm);
      const L = L_ocupado_cm(c.n, phi_cm, smin);
      const cabe = L <= largura + 1e-9;
      const sug: Sugestao = {
        n: c.n,
        diam: c.diam,
        area: c.area,
        sobra: c.area - AsAdotar,
        cabe,
        L,
      };
      (cabe ? resultCabem : resultNao).push(sug);
    }
    // ordenar por sobra (econômico)
    resultCabem.sort((a, b) => a.sobra - b.sobra || a.area - b.area);
    resultNao.sort((a, b) => a.sobra - b.sobra || a.area - b.area);
    return { cabem: resultCabem, naoCabem: resultNao };
  }, [AsAdotar, larguraDentro_cm, candidatas]);

  // garantir que seleção inválida “caia” fora se arranjo deixar de caber
  useEffect(() => {
    if (!selN || !selDiam) return;
    const found = cabem.find((s) => s.n === selN && s.diam === selDiam);
    if (!found) {
      setSelN(null);
      setSelDiam(null);
    }
  }, [cabem, selN, selDiam]);

  // helpers de click
  const selecionar = (s: Sugestao) => {
    if (!s.cabe) return; // não permite selecionar inválida
    setSelN(s.n);
    setSelDiam(s.diam);
  };

  // PDF simplificado (carimbo + arranjo)
  const exportPDF = async () => {
    const [html2canvas, jsPDF] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas.default(document.body, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF.jsPDF({ unit: "pt", format: "a4" });
    const w = pdf.internal.pageSize.getWidth() - 72;
    const h = (canvas.height * w) / canvas.width;
    pdf.text("Laje biapoiada — Carimbo do dimensionamento", 40, 40);
    pdf.addImage(img, "PNG", 36, 60, w, h);
    pdf.save("laje_biapoiada.pdf");
  };

  // seleção sugerida de tabela K (amarelo) / escolhida (ciano)
  // Encontrar índice sugerido de acordo com o concreto selecionado e o Kc calculado
  const colIndexKC = COL_CONCRETO[concretoKey];
  let kIdxSugerida: number | null = null;
  let menorDif = Infinity;

  TABELA_K.forEach((row, idx) => {
    const valorKC = parseFloat(String(row[colIndexKC]));
    if (!isNaN(valorKC)) {
      const dif = Math.abs(valorKC - Kc);
      if (dif < menorDif) {
        menorDif = dif;
        kIdxSugerida = idx;
      }
    }
  });

  // seleção de qual linha mostrar como “sugerida” na UI
  const headerTabelaSugerida =
    kIdxSugerida != null && kIdxSugerida >= 0
      ? `linha ${kIdxSugerida + 1}`
      : "—";

  // ====================================================================
  // [SECTION] Renderização (JSX)
  // ====================================================================
  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <InternalHeader
        title="Laje Biapoiada"
        showBackButton
        backHref="/calculadoras"
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* ---------------------------------------------------------------- */}
        {/* [SECTION] Geometria e carga */}
        {/* ---------------------------------------------------------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-4">
            <h2 className="font-bold mb-3">Geometria da laje (Lx × Ly)</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Lx (m)
                <input
                  type="number"
                  step={0.01}
                  className="mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
                  value={Lx}
                  onChange={(e) => setLx(parseFloat(e.target.value))}
                />
              </label>
              <label className="text-sm">
                Ly (m)
                <input
                  type="number"
                  step={0.01}
                  className="mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
                  value={Ly}
                  onChange={(e) => setLy(parseFloat(e.target.value))}
                />
              </label>
            </div>
            <div className="mt-3 flex justify-center">
              (Visualização da laje desativada)
            </div>
            <div className="mt-2 text-sm">
              Menor vão adotado: <b>{num(L, 2)} m</b> ({menorVao ?? "—"})
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-bold mb-3">Carregamento</h2>
            <label className="text-sm">
              q<sub>base</sub> (kN/m²)
              <input
                type="number"
                step={0.1}
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
                value={qBase}
                onChange={(e) => setQBase(parseFloat(e.target.value))}
              />
            </label>

            <div className="mt-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={usarPP}
                  onChange={(e) => setUsarPP(e.target.checked)}
                />
                Somar PP estimado da LT
              </label>
              <div className="opacity-80">
                PP ≈ 25·[ hf/100 + (bw·(h−hf)/10000)/bf(m) ] ={" "}
                <b>{num(PP_kN_m2, 3)}</b> kN/m²
              </div>
              <div>
                q<sub>total</sub> = <b>{num(qTotal_kN_m2, 3)}</b> kN/m²
              </div>
              <div className="opacity-80">
                Largura tributária bf = <b>{num(bf_m, 2)}</b> m → q' ={" "}
                <b>{num(qLinha, 3)}</b> kN/m
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-bold mb-3">Vão adotado</h2>
            <label className="text-sm">
              L (m)
              <input
                type="number"
                step={0.01}
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
                value={L}
                onChange={(e) => setL(parseFloat(e.target.value))}
              />
            </label>
            <div className="text-sm opacity-80 mt-2">
              Você pode sobrescrever o menor vão manualmente se precisar.
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* [SECTION] Materiais / Treliça, Concreto e Aço */}
        {/* ---------------------------------------------------------------- */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block mb-1 font-semibold">Treliça</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
              value={trelicaKey}
              onChange={(e) => {
                setTrelicaKey(e.target.value as any);
                setKIdxEscolhido(null);
                setSelN(null);
                setSelDiam(null);
              }}
            >
              {Object.entries(TRELICAS).map(([k, v]) => (
                <option key={k} value={k}>
                  {(v as any).displayName ?? k}
                </option>
              ))}
            </select>

            <div className="mt-2 text-sm opacity-80 grid grid-cols-2 gap-x-4">
              <div>bw: <b>{tre.bw} cm</b></div>
              <div>bf: <b>{tre.bf} cm</b></div>
              <div>h: <b>{tre.h} cm</b></div>
              <div>hf: <b>{tre.hf} cm</b></div>
              <div>d: <b>{tre.d} cm</b></div>
              <div>
                φbase/φdiag/φtop:{" "}
                <b>
                  {(tre.arm?.base_mm ?? 5).toFixed(1)} /{" "}
                  {(tre.arm?.diag_mm ?? 4.2).toFixed(1)} /{" "}
                  {(tre.arm?.top_mm ?? 6).toFixed(1)} mm
                </b>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Concreto</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
              value={concretoKey}
              onChange={(e) => {
                setConcretoKey(e.target.value as any);
                setKIdxEscolhido(null);
              }}
            >
              {Object.keys(CONCRETOS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <div className="mt-2 text-sm opacity-80">
              fcd: <b>{num(conc.fcd, 3)}</b> kN/cm²
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Aço</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
              value={acoKey}
              onChange={(e) => {
                setAcoKey(e.target.value as any);
                setKIdxEscolhido(null);
              }}
            >
              {Object.keys(ACOS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <div className="mt-2 text-sm opacity-80">
              fyd: <b>{num(aco.fyd, 3)}</b> kN/cm²
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm opacity-70">Esforços (ELU)</div>
            <div>Vk = <b>{num(Vk, 3)}</b> kN</div>
            <div>Mk = <b>{num(Mk_kNm, 3)}</b> kN·m</div>
            <div>Md = <b>{num(Md_kNcm, 1)}</b> kN·cm</div>
            <div className="mt-2">Kc = <b>{num(Kc, 3)}</b></div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* [SECTION] Tabela K */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Tabela K — clique na linha a adotar</h2>
            <div className="text-sm">
              Sugerida:{" "}
              <span className="px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-900">
                {headerTabelaSugerida}
              </span>{" "}
              (Kc ≈ {num(Kc, 3)})
            </div>
          </div>

          <div className="overflow-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--color-card)]">
                <tr>
                  <th className="px-2 py-2 text-left">Bx</th>
                  <th className="px-2 py-2 text-left">{concretoKey} (kc)</th>
                  <th className="px-2 py-2 text-left">{acoKey} (ks)</th>
                </tr>
              </thead>
              <tbody>
                {TABELA_K.map((row, i) => {
                  const isSug = i === kIdxSugerida;
                  const isSel = i === kIdxEscolhido;
                  const baseHover = "hover:bg-cyan-50 dark:hover:bg-neutral-800";
                  const suggCls = "bg-yellow-100 dark:bg-yellow-900/30";
                  const selCls = "bg-cyan-100 dark:bg-cyan-900/30";
                  const rowCls = isSel ? selCls : isSug ? suggCls : baseHover;

                  return (
                    <tr
                      key={i}
                      onClick={() => setKIdxEscolhido(i)}
                      className={`cursor-pointer ${rowCls}`}
                      title={isSug ? "Linha sugerida pela proximidade do Kc" : ""}
                    >
                      <td className="px-2 py-1 border-t">{getBx(row)}</td>
                      <td className="px-2 py-1 border-t">{getKc(row, concretoKey) ?? "–"}</td>
                      <td className="px-2 py-1 border-t">{getKs(row, acoKey) ?? "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!linha && (
            <p className="mt-2 text-sm opacity-80">
              ➜ Clique na linha <b>amarela</b> (sugerida) para preencher <b>Bx</b> e <b>ks</b>.
            </p>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* [SECTION] Resultado + Arranjos de Armadura */}
        {/* ---------------------------------------------------------------- */}
        {linha && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className="card p-4">
                <div>Bx = <b>{num(Bx!, 3)}</b></div>
                <div>ks = <b>{ks != null ? num(ks, 3) : "–"}</b></div>
                <div className="mt-2">x = Bx·d = <b>{num(x!, 3)}</b> cm</div>
                <div>
                  Verif. T: x {ehT ? ">" : "≤"} 1,25·hf →{" "}
                  <b>{ehT ? "T verdadeira" : "retângulo eq."}</b>
                </div>
              </div>

              <div className="card p-4">
                <div className="font-semibold mb-1">Armadura (método ks)</div>
                <div>As = ks·Md/d = <b>{num(As!, 3)}</b> cm²</div>
                <div>Desconto treliça (0,40): <b>0,40</b> cm²</div>
                <div>As (adotar) = <b>{num(AsAdotar!, 3)}</b> cm²</div>
              </div>

              <div className="card p-4">
                {/* Ambiente / posição (agregado removido) */}
                <div className="grid grid-cols-1 gap-2 items-end">
                  <div className="mt-3 text-sm opacity-80">
                    <div>
                      s<sub>min</sub> = max(φ, 2, 1,2·d<sub>agg</sub>) ⇒{" "}
                      <b>depende da bitola</b> (exibido nas listas).
                    </div>
                    <div>
                      Largura útil (dentro) = bw − 2·c<sub>inf</sub> − 2·φ<sub>base</sub> ={" "}
                      <b>
                        {tre.bw} − 2·1,5 − 2·{(tre.arm?.base_mm ?? 5) / 10} ={" "}
                        {num(larguraDentro_cm, 2)} cm
                      </b>
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      Agregado usado internamente: {D_AGG_DEFAULT} mm (fixo — menu removido)
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* [SECTION] Sugestão de Arranjos que CABEM / NÃO cabem */}
            {/* ---------------------------------------------------------------- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-4">
                <h3 className="font-semibold mb-2">Sugestões (CABEM) — ordem econômica</h3>
                {cabem.length === 0 ? (
                  <div className="text-sm opacity-70">Nenhuma combinação atende e cabe nessa posição.</div>
                ) : (
                  <ul className="space-y-2">
                    {cabem.slice(0, 8).map((s, i) => {
                      const phi_cm = s.diam / 10;
                      const smin = sminFromPhi(phi_cm);
                      const label = `${descArranjo(s.n, s.diam)} — área ≈ ${num(
                        s.area,
                        2
                      )} cm², L = ${num(s.L, 2)} cm → CABE`;
                      const selected = selN === s.n && selDiam === s.diam;
                      return (
                        <li key={i}>
                          <button
                            onClick={() => selecionar(s)}
                            className={`w-full text-left px-3 py-2 rounded-lg border ${
                              selected
                                ? "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300"
                                : "hover:bg-cyan-50 dark:hover:bg-neutral-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{descArranjo(s.n, s.diam)}</span>
                              <span className="text-xs opacity-70">
                                s<sub>min</sub>=max({num(phi_cm, 2)},{2.0.toFixed(1)},{num(
                                  (1.2 * D_AGG_DEFAULT) / 10,
                                  2
                                )}) → {num(smin, 2)} cm
                              </span>
                            </div>
                            <div className="text-sm opacity-90">{label}</div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="card p-4">
                <h3 className="font-semibold mb-2">Não cabem (mostradas só para referência)</h3>
                {naoCabem.length === 0 ? (
                  <div className="text-sm opacity-70">—</div>
                ) : (
                  <ul className="space-y-1">
                    {naoCabem.slice(0, 6).map((s, i) => {
                      const phi_cm = s.diam / 10;
                      const smin = sminFromPhi(phi_cm);
                      const label = `${descArranjo(s.n, s.diam)} — área ≈ ${num(
                        s.area,
                        2
                      )} cm², L = ${num(s.L, 2)} cm → NÃO cabe`;
                      return (
                        <li
                          key={i}
                          className="px-3 py-2 rounded-lg border bg-neutral-100 dark:bg-neutral-900/30 opacity-70 cursor-not-allowed"
                          title="Não selecionável nesta posição"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{descArranjo(s.n, s.diam)}</span>
                            <span className="text-xs">
                              s<sub>min</sub>=max({num(phi_cm, 2)},{2.0.toFixed(1)},{num(
                                (1.2 * D_AGG_DEFAULT) / 10,
                                2
                              )}) → {num(smin, 2)} cm
                            </span>
                          </div>
                          <div className="text-sm">{label}</div>
                        </li>
                      );
                    })}
                    {naoCabem.length > 6 && (
                      <div className="text-xs opacity-60 mt-1">
                        … e mais {naoCabem.length - 6} combinações que também não cabem.
                      </div>
                    )}
                  </ul>
                )}
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* [SECTION] Carimbo / Exportação PDF */}
            {/* ---------------------------------------------------------------- */}
            <section className="mt-6">
              <div ref={arranjoRef} className="card p-4">
                <div className="font-semibold mb-2">
                  Arranjo selecionado:{" "}
                  {selN && selDiam ? (
                    <>{descArranjo(selN, selDiam)}</>
                  ) : (
                    "—"
                  )}
                </div>

                <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 opacity-90">
                  <div>
                    Posição: <b>dentro da mesa</b>
                  </div>
                  <div>
                    Largura disponível:{" "}
                    <b>{`${num(larguraDentro_cm, 2)} cm`}</b>
                  </div>
                  <div>
                    Verificação s<sub>min</sub>: conforme NBR — mostrado nas listas acima.
                  </div>
                  <div>
                    q<sub>total</sub> ({usarPP ? "com" : "sem"} PP LT) ={" "}
                    <b>{num(qTotal_kN_m2, 3)}</b> kN/m²
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-semibold shadow hover:bg-opacity-90 transition"
                >
                  Exportar PDF (carimbo)
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
// ======================================================================
// [END OF FILE]
// ======================================================================
