// src/app/lajes/continua/page.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import InternalHeader from "@/app/components/InternalHeader";
import Footer from "@/app/components/Footer";
// ATENÇÃO: nenhum import de SlabSketch aqui — o desenho é local a esta página
import {
  TRELICAS,
  CONCRETOS,
  ACOS,
  TABELA_K,
  DIAMETROS_PADRAO,
  TABELA_ACO,
} from "@/components/constantes";

type KeyOf<T> = Extract<keyof T, string>;
type Ambiente = "I" | "II" | "III" | "IV";

const AREA_TRELICA_CM2 = 0.40;
const COVER_RECOMENDADO_LAJE: Record<Ambiente, number> = { I: 2.0, II: 2.5, III: 3.0, IV: 4.0 };
const fmt = (v: number, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : "–");

// Mapeamento de colunas da TABELA_K
const COL_CONCRETO: Record<KeyOf<typeof CONCRETOS>, number> =
  { C20: 1, C25: 2, C30: 3, C35: 4, C40: 5, C45: 6, C50: 7 };
const COL_ACO: Record<KeyOf<typeof ACOS>, number> =
  { CA25: 8, CA50: 9, CA60: 10 };

const getBxFromRow = (row: number[]) => row[0];
const getKcFromRow = (row: number[], concretoKey: KeyOf<typeof CONCRETOS>) => row[COL_CONCRETO[concretoKey]] ?? null;
const getKsFromRow = (row: number[], acoKey: KeyOf<typeof ACOS>) => (row[COL_ACO[acoKey]] ?? null) as number | null;

// Gerar candidatas nØφ (área ≥ AsNec) ordenadas por menor sobra
function gerarCandidatas(areaNec: number) {
  const cand: { n: number; diam: number; desc: string; area: number; sobra: number }[] = [];
  for (const diam of DIAMETROS_PADRAO) {
    const areas = TABELA_ACO[diam];
    areas.forEach((a, i) => {
      const n = i + 1;
      if (a >= areaNec) cand.push({ n, diam, desc: `${n}Ø${diam}`, area: a, sobra: a - areaNec });
    });
  }
  return cand.sort((a, b) => a.sobra - b.sobra);
}

// Verificação geométrica SEMPRE em bw
function checarCabimento(n: number, diam_mm: number, bw: number, c: number, sMin: number, sMax: number) {
  const phi = diam_mm / 10; // cm
  const larguraUtil = bw - 2 * c;
  if (larguraUtil <= 0) return { cabe: false, sClear: -1 };
  if (n === 1) {
    const cabe = phi <= larguraUtil + 1e-9;
    const sClear = larguraUtil - phi;
    return { cabe, sClear };
  }
  const sClear = (larguraUtil - n * phi) / (n - 1);
  const cabe = sClear >= sMin - 1e-9 && sClear <= sMax + 1e-9;
  return { cabe, sClear };
}

/** Desenho LOCAL da nervura (independente da biapoiada). */
function RibSketchInline({
  bw, hf, n, diam_mm, c, sClear, widthPx = 480,
}: {
  bw: number; hf: number;
  n?: number | null; diam_mm?: number | null; c: number; sClear: number;
  widthPx?: number;
}) {
  const k = 4; // px/cm
  const pad = 20;
  const W = Math.max(widthPx, (bw + 2 * (pad / k)) * k);
  const H = 160;

  // barras
  const phi = (diam_mm ?? 0) / 10; // cm
  const r = Math.max(2, (phi * k) / 2);
  const usable = bw - 2 * c; // cm
  const cx0 = pad + (c + phi / 2) * k;
  const cy = H - pad - (c + phi / 2) * k;
  const step = (n && n > 1) ? (phi + sClear) * k : 0;
  const xs = Array.from({ length: n ?? 0 }, (_, i) => cx0 + i * step);

  return (
    <svg width={W} height={H} className="rounded border bg-white">
      {/* nervura: representar bw × (hf + nervura) com realce da mesa hf */}
      <rect x={pad} y={pad} width={bw * k} height={(H - 2 * pad)} fill="#f8fafc" stroke="#334155" />
      <rect x={pad} y={pad} width={bw * k} height={hf * k} fill="#e2e8f0" stroke="#334155" />

      {/* linha de referência do cobrimento c */}
      <line x1={pad} y1={cy} x2={pad + bw * k} y2={cy} stroke="#64748b" strokeDasharray="4 4" />
      <text x={pad + bw * k + 6} y={cy + 4} fontSize="10" fill="#334155">
        c={c.toFixed(1)} cm • s={Number.isFinite(sClear) ? sClear.toFixed(2) : "—"} cm
      </text>

      {/* barras */}
      {xs.map((x, i) => (<circle key={i} cx={x} cy={cy} r={r} fill="#111827" />))}

      {/* legendas */}
      <text x={pad} y={pad - 6} fontSize="12" fontWeight="bold" fill="#0f172a">bw={bw} cm</text>
      <text x={pad + bw * k + 6} y={pad + 12} fontSize="10" fill="#334155">hf={hf} cm</text>
    </svg>
  );
}

export default function LajeContinuaPage() {
  // Materiais
  const [trelicaKey, setTrelicaKey] = useState<KeyOf<typeof TRELICAS>>("TR12");
  const [concretoKey, setConcretoKey] = useState<KeyOf<typeof CONCRETOS>>("C30");
  const [acoKey, setAcoKey] = useState<KeyOf<typeof ACOS>>("CA50");

  // Carregamento e dois vãos
  const [qPrim, setQPrim] = useState<number>(5);   // kN/m²
  const [L1, setL1] = useState<number>(3.80);      // m
  const [L2, setL2] = useState<number>(4.20);      // m
  const [modoManualMk, setModoManualMk] = useState<boolean>(false);
  const [mk1, setMk1] = useState<number>(25); // kN·m (vão 1, +)
  const [mk2, setMk2] = useState<number>(32); // kN·m (apoio, −)
  const [mk3, setMk3] = useState<number>(25); // kN·m (vão 2, +)

  // Ambiente / espaçamentos
  const [ambiente, setAmbiente] = useState<Ambiente>("II");
  const [c, setC] = useState<number>(COVER_RECOMENDADO_LAJE["II"]);
  const [sMin, setSMin] = useState<number>(1.5);
  const [sMax, setSMax] = useState<number>(20);

  // Estágio ativo e seleções Tabela K
  const [estagio, setEstagio] = useState<1 | 2 | 3>(1);
  const [kIdxSel1, setKIdxSel1] = useState<number | null>(null);
  const [kIdxSel2, setKIdxSel2] = useState<number | null>(null);
  const [kIdxSel3, setKIdxSel3] = useState<number | null>(null);

  // Arranjos escolhidos por estágio (n e φ)
  const [selN1, setSelN1] = useState<number | null>(null);
  const [selD1, setSelD1] = useState<number | null>(null);
  const [selN2, setSelN2] = useState<number | null>(null);
  const [selD2, setSelD2] = useState<number | null>(null);
  const [selN3, setSelN3] = useState<number | null>(null);
  const [selD3, setSelD3] = useState<number | null>(null);

  // PDF ref
  const pdfRef = useRef<HTMLDivElement>(null);

  // Recomendar cobrimento por ambiente
  useEffect(() => { setC(COVER_RECOMENDADO_LAJE[ambiente]); }, [ambiente]);

  // Dados
  const tre = TRELICAS[trelicaKey];
  const conc = CONCRETOS[concretoKey]; // .fcd
  const aco = ACOS[acoKey];            // .fyd

  // q linear na faixa 0,42 m
  const q = qPrim * 0.42; // kN/m

  // Momentos (kN·m)
  const mkAuto = useMemo(() => {
    const m1 = (q * L1 * L1) / 16;           // vão 1 (+)
    const Lm = (L1 + L2) / 2;
    const m2 = (q * Lm * Lm) / 12;           // apoio (−) — magnitude
    const m3 = (q * L2 * L2) / 16;           // vão 2 (+)
    return { m1, m2, m3 };
  }, [q, L1, L2]);

  const mk = modoManualMk ? { m1: mk1, m2: mk2, m3: mk3 } : mkAuto;

  // ELU: Md (kN·cm)
  const Md1 = mk.m1 * 1.4 * 100;
  const Md2 = mk.m2 * 1.4 * 100;
  const Md3 = mk.m3 * 1.4 * 100;

  // Kc
  const Kc1 = (tre.bw * tre.d * tre.d) / Md1;
  const Kc2 = (tre.bw * tre.d * tre.d) / Md2;
  const Kc3 = (tre.bw * tre.d * tre.d) / Md3;

  // Sugerir linha K
  const sugerirIdx = (Kc: number) => {
    let idx = -1, best = Infinity;
    for (let i = 0; i < TABELA_K.length; i++) {
      const kcCell = getKcFromRow(TABELA_K[i], concretoKey);
      if (kcCell == null) continue;
      const diff = Math.abs(kcCell - Kc);
      if (diff < best) { best = diff; idx = i; }
    }
    return idx;
  };
  const kIdxSug1 = useMemo(() => sugerirIdx(Kc1), [Kc1, concretoKey]);
  const kIdxSug2 = useMemo(() => sugerirIdx(Kc2), [Kc2, concretoKey]);
  const kIdxSug3 = useMemo(() => sugerirIdx(Kc3), [Kc3, concretoKey]);

  // Escolha na tabela
  const kIdxSelAtivo = estagio === 1 ? kIdxSel1 : estagio === 2 ? kIdxSel2 : kIdxSel3;
  const kIdxSugAtivo = estagio === 1 ? kIdxSug1 : estagio === 2 ? kIdxSug2 : kIdxSug3;
  const MdAtivo = estagio === 1 ? Md1 : estagio === 2 ? Md2 : Md3;

  function escolherLinhaK(i: number) {
    if (estagio === 1) setKIdxSel1(i);
    if (estagio === 2) setKIdxSel2(i);
    if (estagio === 3) setKIdxSel3(i);
  }

  // Resultados por estágio
  function resultadosDoEstagio(idxSel: number | null, MdStage: number) {
    if (idxSel == null) return { Bx: null, ks: null, x: null, tOk: null, As: null, AsAdotar: null };
    const row = TABELA_K[idxSel];
    const Bx = getBxFromRow(row);
    const ks = getKsFromRow(row, acoKey);
    const x = Bx != null ? Bx * tre.d : null;
    const tOk = x != null ? x > 1.25 * tre.hf : null;
    const As = ks != null ? (ks * MdStage) / tre.d : null;
    const AsAdotar = As != null ? Math.max(As - AREA_TRELICA_CM2, 0) : null;
    return { Bx, ks, x, tOk, As, AsAdotar };
  }
  const R1 = resultadosDoEstagio(kIdxSel1, Md1);
  const R2 = resultadosDoEstagio(kIdxSel2, Md2);
  const R3 = resultadosDoEstagio(kIdxSel3, Md3);

  // Sugestões (cabimento em bw)
  const gerarSugestoes = (AsNec: number | null) => {
    if (AsNec == null || AsNec <= 0) return { fits: [] as any[], notFits: [] as any[] };
    const cand = gerarCandidatas(AsNec);
    const fits: typeof cand = [];
    const notFits: typeof cand = [];
    for (const cnd of cand) {
      const { cabe } = checarCabimento(cnd.n, cnd.diam, tre.bw, c, sMin, sMax);
      (cabe ? fits : notFits).push(cnd);
    }
    return { fits: fits.slice(0, 3), notFits: notFits.slice(0, 3) };
  };
  const S1 = useMemo(() => gerarSugestoes(R1.AsAdotar), [R1.AsAdotar, tre.bw, c, sMin, sMax]);
  const S2 = useMemo(() => gerarSugestoes(R2.AsAdotar), [R2.AsAdotar, tre.bw, c, sMin, sMax]);
  const S3 = useMemo(() => gerarSugestoes(R3.AsAdotar), [R3.AsAdotar, tre.bw, c, sMin, sMax]);

  // manter seleção estável
  useEffect(() => {
    if (S1.fits.length) {
      const ok = selN1 && selD1 && S1.fits.some(f => f.n === selN1 && f.diam === selD1);
      if (!ok) { setSelN1(S1.fits[0].n); setSelD1(S1.fits[0].diam); }
    } else { setSelN1(null); setSelD1(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S1.fits.map(f => `${f.n}-${f.diam}`).join(",")]);

  useEffect(() => {
    if (S2.fits.length) {
      const ok = selN2 && selD2 && S2.fits.some(f => f.n === selN2 && f.diam === selD2);
      if (!ok) { setSelN2(S2.fits[0].n); setSelD2(S2.fits[0].diam); }
    } else { setSelN2(null); setSelD2(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S2.fits.map(f => `${f.n}-${f.diam}`).join(",")]);

  useEffect(() => {
    if (S3.fits.length) {
      const ok = selN3 && selD3 && S3.fits.some(f => f.n === selN3 && f.diam === selD3);
      if (!ok) { setSelN3(S3.fits[0].n); setSelD3(S3.fits[0].diam); }
    } else { setSelN3(null); setSelD3(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S3.fits.map(f => `${f.n}-${f.diam}`).join(",")]);

  // sClear selecionado
  const sClearSelecionado = (n: number | null, d: number | null) => {
    if (!n || !d) return null;
    return checarCabimento(n, d, tre.bw, c, sMin, sMax).sClear;
  };
  const s1 = sClearSelecionado(selN1, selD1);
  const s2 = sClearSelecionado(selN2, selD2);
  const s3 = sClearSelecionado(selN3, selD3);

  // PDF
  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    const [html2canvas, jsPDF] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const canvas = await html2canvas.default(pdfRef.current, { scale: 2, backgroundColor: null });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF.jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 42;
    const maxW = pageW - margin * 2;
    const ratio = canvas.width / canvas.height;
    const w = Math.min(maxW, canvas.width);
    const h = w / ratio;
    pdf.addImage(img, "PNG", margin, margin, w, h);
    pdf.save("laje_continua.pdf");
  };

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <InternalHeader title="Laje Contínua" showBackButton backHref="/calculadoras" />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Geometria: dois vãos (L1 e L2) + planta ilustrativa */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-4">
            <h2 className="font-bold mb-3">Geometria — vãos consecutivos</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label>L1 (m)
                <input type="number" step={0.01} className="mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
                  value={L1} onChange={(e)=>setL1(parseFloat(e.target.value))} />
              </label>
              <label>L2 (m)
                <input type="number" step={0.01} className="mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
                  value={L2} onChange={(e)=>setL2(parseFloat(e.target.value))} />
              </label>
            </div>

            {/* Esboço em planta dos dois vãos */}
            <div className="mt-3">
              <svg width="100%" height="70" viewBox="0 0 600 70" className="rounded border bg-[var(--color-card)]">
                {/* vão 1 */}
                <line x1="20" y1="35" x2="300" y2="35" stroke="currentColor" />
                <circle cx="20" cy="35" r="3" fill="currentColor" />
                <circle cx="300" cy="35" r="3" fill="currentColor" />
                <text x="160" y="25" fontSize="12">L1 = {fmt(L1,2)} m</text>
                {/* vão 2 */}
                <line x1="300" y1="35" x2="580" y2="35" stroke="currentColor" />
                <circle cx="580" cy="35" r="3" fill="currentColor" />
                <text x="440" y="25" fontSize="12">L2 = {fmt(L2,2)} m</text>
              </svg>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-bold mb-3">Carregamento</h2>
            <label className="text-sm block mb-1">q’ (kN/m²)</label>
            <input type="number" step={0.1} className="w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
              value={qPrim} onChange={(e)=>setQPrim(parseFloat(e.target.value))} />
            <div className="text-sm opacity-80 mt-2">q = <b>{fmt(q,3)}</b> kN/m (faixa 0,42 m)</div>
          </div>

          <div className="card p-4">
            <h2 className="font-bold mb-3">Vãos adotados</h2>
            <div className="text-sm">L1 = <b>{fmt(L1,2)}</b> m • L2 = <b>{fmt(L2,2)}</b> m</div>
            <div className="text-sm mt-1">L<sub>médio</sub> (apoio) = <b>{fmt((L1+L2)/2,2)}</b> m</div>
            <div className="mt-3 text-xs opacity-70">
              Mk automático: Mk1=+q·L1²/16, Mk2=−q·Lm²/12, Mk3=+q·L2²/16 (magnitudes).
            </div>
          </div>
        </section>

        {/* Materiais e esforços */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="md:col-span-2 card p-4">
            <h2 className="font-bold mb-3">Treliça</h2>
            <select className="w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
              value={trelicaKey}
              onChange={(e)=>{ setTrelicaKey(e.target.value as any); setKIdxSel1(null); setKIdxSel2(null); setKIdxSel3(null); }}
            >
              {Object.keys(TRELICAS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <div className="mt-2 text-sm opacity-80 grid grid-cols-2 gap-x-4">
              <div>bw: <b>{tre.bw} cm</b></div><div>bf: <b>{tre.bf} cm</b></div>
              <div>h:  <b>{tre.h} cm</b></div><div>hf: <b>{tre.hf} cm</b></div>
              <div>d:  <b>{tre.d} cm</b></div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-bold mb-3">Concreto</h2>
            <select className="w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
              value={concretoKey}
              onChange={(e)=>{ setConcretoKey(e.target.value as any); setKIdxSel1(null); setKIdxSel2(null); setKIdxSel3(null); }}
            >
              {Object.keys(CONCRETOS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <div className="mt-2 text-sm opacity-80">fcd: <b>{fmt(CONCRETOS[concretoKey].fcd,3)}</b> kN/cm²</div>
          </div>

          <div className="card p-4">
            <h2 className="font-bold mb-3">Aço</h2>
            <select className="w-full border rounded-lg px-3 py-2 bg-[var(--color-card)]"
              value={acoKey} onChange={(e)=>{ setAcoKey(e.target.value as any); }}
            >
              {Object.keys(ACOS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <div className="mt-2 text-sm opacity-80">fyd: <b>{fmt(ACOS[acoKey].fyd,3)}</b> kN/cm²</div>
          </div>

          <div className="card p-4">
            <div className="text-sm opacity-70">Esforços (ELU)</div>
            <div>Mk1 = <b>{fmt(mk.m1,3)}</b> kN·m • Md1 = <b>{fmt(Md1,1)}</b> kN·cm • Kc1 = <b>{fmt(Kc1,3)}</b></div>
            <div>Mk2 = <b>{fmt(mk.m2,3)}</b> kN·m • Md2 = <b>{fmt(Md2,1)}</b> kN·cm • Kc2 = <b>{fmt(Kc2,3)}</b></div>
            <div>Mk3 = <b>{fmt(mk.m3,3)}</b> kN·m • Md3 = <b>{fmt(Md3,1)}</b> kN·cm • Kc3 = <b>{fmt(Kc3,3)}</b></div>
            <div className="mt-2 flex items-center gap-2">
              <input id="modo" type="checkbox" checked={modoManualMk} onChange={(e)=>setModoManualMk(e.target.checked)} />
              <label htmlFor="modo" className="text-sm">Preencher momentos Mk manualmente</label>
            </div>
            {modoManualMk && (
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                <label>Mk1
                  <input type="number" step={0.1} className="mt-1 w-full border rounded-lg px-2 py-1 bg-[var(--color-card)]"
                    value={mk1} onChange={(e)=>setMk1(parseFloat(e.target.value))}/>
                </label>
                <label>Mk2
                  <input type="number" step={0.1} className="mt-1 w-full border rounded-lg px-2 py-1 bg-[var(--color-card)]"
                    value={mk2} onChange={(e)=>setMk2(parseFloat(e.target.value))}/>
                </label>
                <label>Mk3
                  <input type="number" step={0.1} className="mt-1 w-full border rounded-lg px-2 py-1 bg-[var(--color-card)]"
                    value={mk3} onChange={(e)=>setMk3(parseFloat(e.target.value))}/>
                </label>
              </div>
            )}
          </div>
        </section>

        {/* Tabela K (abas por estágio) */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">
              Tabela K — <span className="opacity-80">Bx | {concretoKey} (kc) | {acoKey} (ks)</span>
            </h2>
            <div className="flex gap-2">
              {[1,2,3].map(i=>(
                <button
                  key={i}
                  onClick={()=>setEstagio(i as 1|2|3)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${estagio===i ? "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300" : "hover:bg-cyan-50 dark:hover:bg-neutral-800"}`}
                >
                  Estágio {i}
                </button>
              ))}
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
                  const kcCell = getKcFromRow(row, concretoKey);
                  const ksCell = getKsFromRow(row, acoKey);
                  const isSug = i === (estagio===1? kIdxSug1 : estagio===2? kIdxSug2 : kIdxSug3);
                  const isSel = i === (estagio===1? kIdxSel1 ?? -1 : estagio===2? kIdxSel2 ?? -1 : kIdxSel3 ?? -1);
                  const baseHover = "hover:bg-cyan-50 dark:hover:bg-neutral-800";
                  const suggCls = "bg-yellow-100 dark:bg-yellow-900/30";
                  const selCls  = "bg-cyan-100 dark:bg-cyan-900/30";
                  const rowCls  = isSel ? selCls : isSug ? suggCls : baseHover;
                  return (
                    <tr key={i} onClick={()=>escolherLinhaK(i)} className={`cursor-pointer ${rowCls}`}>
                      <td className="px-2 py-1 border-t">{getBxFromRow(row)}</td>
                      <td className="px-2 py-1 border-t">{kcCell ?? "–"}</td>
                      <td className="px-2 py-1 border-t">{ksCell ?? "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-sm opacity-80 mt-2">
            Sugerida (Estágio {estagio}):{" "}
            { (estagio===1? kIdxSug1 : estagio===2? kIdxSug2 : kIdxSug3) >= 0
              ? `linha ${(estagio===1? kIdxSug1 : estagio===2? kIdxSug2 : kIdxSug3)! + 1}`
              : "—"
            } {" "}
            (Kc ≈ {fmt(estagio===1?Kc1:estagio===2?Kc2:Kc3,3)})
          </div>
        </section>

        {/* Estágios + desenho local da nervura */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10" ref={pdfRef}>
          {[1,2,3].map((i)=> {
            const idxSel = i===1? kIdxSel1 : i===2? kIdxSel2 : kIdxSel3;
            const Md = i===1? Md1 : i===2? Md2 : Md3;
            const Kc = i===1? Kc1 : i===2? Kc2 : Kc3;
            const R  = i===1? R1  : i===2? R2  : R3;
            const S  = i===1? S1  : i===2? S2  : S3;
            const selN = i===1? selN1 : i===2? selN2 : selN3;
            const selD = i===1? selD1 : i===2? selD2 : selD3;
            const setN = i===1? setSelN1 : i===2? setSelN2 : setSelN3;
            const setD = i===1? setSelD1 : i===2? setSelD2 : setSelD3;
            const sC  = i===1? s1 : i===2? s2 : s3;

            return (
              <div className="card p-4" key={i}>
                <h3 className="font-semibold mb-2">
                  Estágio {i} {i===2 ? "(apoio −)" : "(vão +)"}
                </h3>

                <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                  <div>Md = <b>{fmt(Md,1)}</b> kN·cm</div>
                  <div>Kc = <b>{fmt(Kc,3)}</b></div>
                </div>

                {idxSel == null ? (
                  <div className="text-sm opacity-80 mb-3">Selecione uma linha na Tabela K.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>Bx = <b>{fmt(R.Bx ?? NaN,3)}</b></div>
                      <div>ks = <b>{R.ks != null ? fmt(R.ks,3) : "–"}</b></div>
                      <div>x  = <b>{fmt(R.x ?? NaN,3)}</b> cm</div>
                      <div>Seção T: <b>{R.tOk ? "Verdadeira" : "Retangular eq."}</b></div>
                    </div>

                    <div className="text-sm mb-2">
                      As = ks·Md/d = <b>{fmt(R.As ?? NaN,3)}</b> cm² • Adotar = <b>{fmt(R.AsAdotar ?? NaN,3)}</b> cm²
                      {" "}<span className="opacity-70">(−0,40 cm² da treliça)</span>
                    </div>

                    <div className="text-sm opacity-80 mb-1">Sugestões (ordem econômica)</div>
                    <div className="flex flex-col gap-2 mb-3">
                      {S.fits.length ? S.fits.map((s, j)=> {
                        const selected = selN === s.n && selD === s.diam;
                        const scalc = checarCabimento(s.n, s.diam, tre.bw, c, sMin, sMax).sClear;
                        return (
                          <button
                            key={`${s.n}-${s.diam}`}
                            onClick={()=>{ setN(s.n); setD(s.diam); }}
                            className={`text-left px-3 py-2 rounded-lg border transition
                              ${selected ? "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300"
                                         : "hover:bg-cyan-50 dark:hover:bg-neutral-800"}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{s.desc}</span>
                              <span className="text-xs opacity-70">{j===0 ? "mais econômica" : ""}</span>
                            </div>
                            <div className="text-sm">
                              área {fmt(s.area,2)} cm² (sobra {fmt(s.sobra,2)} cm²) • s = {fmt(Math.max(scalc,0),2)} cm
                            </div>
                          </button>
                        );
                      }) : <div className="text-sm opacity-60">—</div>}
                    </div>

                    <div className="mt-2 p-3 rounded-lg border flex justify-center">
                      <RibSketchInline
                        bw={tre.bw}
                        hf={tre.hf}
                        n={selN ?? undefined}
                        diam_mm={selD ?? undefined}
                        c={c}
                        sClear={Math.max(sC ?? 0, 0)}
                        widthPx={480}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </section>

        {/* Ambiente / PDF */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="card p-4">
            <div className="text-sm opacity-80 mb-2">Ambiente / Cobertura / Espaçamentos</div>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs">
                Ambiente
                <select className="mt-1 w-full border rounded-lg px-2 py-1 bg-[var(--color-card)] text-sm"
                  value={ambiente} onChange={(e)=>setAmbiente(e.target.value as Ambiente)}>
                  <option value="I">I</option><option value="II">II</option>
                  <option value="III">III</option><option value="IV">IV</option>
                </select>
              </label>
              <label className="text-xs">
                c (cm)
                <input type="number" step={0.1}
                  className="mt-1 w-full border rounded-lg px-2 py-1 bg-[var(--color-card)] text-sm"
                  value={c} onChange={(e)=>setC(parseFloat(e.target.value))} />
              </label>
              <button
                className="self-end px-2 py-1 rounded-lg border text-xs hover:bg-cyan-50 dark:hover:bg-neutral-800"
                onClick={()=>setC(COVER_RECOMENDADO_LAJE[ambiente])}
              >
                usar recomendado
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <label className="text-xs">
                s<sub>min</sub> (cm)
                <input type="number" step={0.1}
                  className="mt-1 w-full border rounded-lg px-2 py-1 bg-[var(--color-card)] text-sm"
                  value={sMin} onChange={(e)=>setSMin(parseFloat(e.target.value))} />
              </label>
              <label className="text-xs">
                s<sub>max</sub> (cm)
                <input type="number" step={0.1}
                  className="mt-1 w-full border rounded-lg px-2 py-1 bg-[var(--color-card)] text-sm"
                  value={sMax} onChange={(e)=>setSMax(parseFloat(e.target.value))} />
              </label>
            </div>
          </div>

          <div className="lg:col-span-2 card p-4 flex items-center justify-between">
            <div className="text-sm opacity-80">
              PDF (carimbo): TR, fcd/fyd, q’, L1/L2/Lm, Kc(1–3), linha K (1–3), Bx/x, As/As’, arranjos (nØφ), s (bw) e verificação.
            </div>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-semibold shadow hover:bg-opacity-90 transition"
            >
              Exportar PDF
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
