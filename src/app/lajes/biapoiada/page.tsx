// src/app/lajes/biapoiada/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InternalHeader from "@/app/components/InternalHeader";
import Footer from "@/app/components/Footer";
import {
  TRELICAS,
  CONCRETOS,
  ACOS,
  TABELA_K,
  TABELA_ACO,
  DIAMETROS_PADRAO,
} from "@/components/constantes";

/* ============================
   Utilitários e tipos
   ============================ */
const num = (v?: number, d = 3) =>
  Number.isFinite(v as number) ? (v as number).toFixed(d) : "–";

type KeyOf<T> = Extract<keyof T, string>;

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

type TreExt = {
  bw: number;
  bf: number;
  h: number;
  hf: number;
  d: number;
  h_trelica_cm?: number;
  arm?: {
    top_mm: number;
    diag_mm: number;
    base_mm: number;
  };
};

const L_ocupado_cm = (n: number, phi_cm: number, smin_cm: number) =>
  n * phi_cm + (n - 1) * smin_cm;

const larguraUtilDentro = (
  tre: TreExt,
  c_inf_cm: number,
  phi_base_cm: number
) => tre.bw - 2 * c_inf_cm - 2 * phi_base_cm;

const descArranjo = (n: number, diam: number) => `${n}Ø${diam}`;

type Sugestao = {
  n: number;
  diam: number;
  area: number; // cm²
  sobra: number;
  cabe: boolean;
  L: number; // cm
  reason?: string | null;
};

const D_AGG_DEFAULT = 19; // mm
const STORAGE_KEY = "laje:state";
const STORAGE_SAVED_KEY = "lajes:saved";

/* ----------------------------
   simple number input hook
   ---------------------------- */
const useNumberInput = (initial: number, min = 0.0001) => {
  const [value, setValue] = useState<number>(initial);
  const [error, setError] = useState<string | null>(null);

  const onChange = (v: string) => {
    const n = Number(String(v).replace(",", "."));
    setValue(n);
    if (!isFinite(n) || n < min) setError(`Informe valor >= ${min}`);
    else setError(null);
  };

  const onBlurValidate = () => {
    if (!isFinite(value) || value < min) setError(`Informe valor >= ${min}`);
    else setError(null);
  };

  return { value, setValue, error, onChange, onBlurValidate };
};

/* ============================
   Classe agressividade (NBR 6118)
   Padrões para lajes (mm)
   ============================ */
const AGR_CLASSES = ["I", "II", "III", "IV"] as const;
type AgrClass = typeof AGR_CLASSES[number];

const DEFAULT_COVER_MM_FOR_LAJES: Record<AgrClass, number> = {
  I: 20,
  II: 25,
  III: 35,
  IV: 45,
};

/* ============================
   Helpers para export (internos)
   ============================ */
const tdStyle = () => "padding:6px;border:1px solid #ddd;font-size:12px";
const titleCase = (s: string) =>
  String(s)
    .replace(/\s+/g, " ")
    .trim();

const renderSingleLajeHTML = (opts: {
  title: string;
  trelicaKey: KeyOf<typeof TRELICAS>;
  concretoKey: KeyOf<typeof CONCRETOS>;
  acoKey: KeyOf<typeof ACOS>;
  Lx: number;
  Ly: number;
  L: number;
  qBase: number;
  usarPP: boolean;
  kIdxEscolhido: number | null;
  selN: number | null;
  selDiam: number | null;
  agrClass: AgrClass;
  coverOverrideCm: number | null;
}): string => {
  try {
    const tre = TRELICAS[opts.trelicaKey] as TreExt;
    const conc = CONCRETOS[opts.concretoKey] as any;
    const aco = ACOS[opts.acoKey] as any;

    const bf_m = tre.bf / 100;
    const gamma_conc = 25;
    const capa_m = tre.hf / 100;
    const nerv_m = (tre.bw * Math.max(0, tre.h - tre.hf) / 10000) / bf_m;
    const PP_kN_m2 = gamma_conc * (capa_m + nerv_m);
    const qTotal_kN_m2 = opts.usarPP ? opts.qBase + PP_kN_m2 : opts.qBase;
    const qLinha = qTotal_kN_m2 * bf_m;
    const Vk = (qLinha * opts.L) / 2;
    const Mk_kNm = (qLinha * opts.L * opts.L) / 8;
    const Md_kNcm = Mk_kNm * 1.4 * 100;
    const Kc = isFinite(Md_kNcm) && Md_kNcm !== 0 ? (tre.bw * tre.d * tre.d) / Md_kNcm : NaN;

    const Bx = opts.kIdxEscolhido != null ? getBx(TABELA_K[opts.kIdxEscolhido]) : "–";
    const ks = opts.kIdxEscolhido != null ? getKs(TABELA_K[opts.kIdxEscolhido], opts.acoKey) : "–";
    const x = typeof Bx === "number" && tre.d ? (Bx as number) * tre.d : "–";
    const ehT = typeof x === "number" ? (x > 1.25 * tre.hf ? "T verdadeira" : "retângulo eq.") : "–";
    const As = typeof ks === "number" && tre.d ? (ks as number) * Md_kNcm / tre.d : null;
    const AsAdotar = As != null ? Math.max(As - 0.4, 0) : null;

    const arranjo = opts.selN && opts.selDiam ? `${opts.selN}Ø${opts.selDiam}` : "–";
    const coverUsedMm = opts.coverOverrideCm != null ? opts.coverOverrideCm * 10 : DEFAULT_COVER_MM_FOR_LAJES[opts.agrClass];

    return `
      <section style="page-break-inside:avoid;margin-bottom:18px">
        <h2 style="font-size:14px;margin:6px 0">${titleCase(opts.title)}</h2>
        <table style="width:100%;border-collapse:collapse">
          <tbody>
            <tr><td style="${tdStyle()}">Treliça</td><td style="${tdStyle()}">${opts.trelicaKey}</td></tr>
            <tr><td style="${tdStyle()}">Concreto</td><td style="${tdStyle()}">${opts.concretoKey} (fcd=${num(conc.fcd,3)} kN/cm²)</td></tr>
            <tr><td style="${tdStyle()}">Aço</td><td style="${tdStyle()}">${opts.acoKey} (fyd=${num(aco.fyd,3)} kN/cm²)</td></tr>
            <tr><td style="${tdStyle()}">Lx × Ly (m)</td><td style="${tdStyle()}">${num(opts.Lx,2)} × ${num(opts.Ly,2)}</td></tr>
            <tr><td style="${tdStyle()}">L adotado (m)</td><td style="${tdStyle()}">${num(opts.L,3)}</td></tr>
            <tr><td style="${tdStyle()}">q base (kN/m²)</td><td style="${tdStyle()}">${num(opts.qBase,3)} (usarPP: ${opts.usarPP ? "sim" : "não"})</td></tr>
            <tr><td style="${tdStyle()}">Cobrimento nominal usado</td><td style="${tdStyle()}">${coverUsedMm} mm (Classe ${opts.agrClass})</td></tr>
            <tr><td style="${tdStyle()}">Vk (kN)</td><td style="${tdStyle()}">${num(Vk,3)}</td></tr>
            <tr><td style="${tdStyle()}">Mk (kN·m)</td><td style="${tdStyle()}">${num(Mk_kNm,4)}</td></tr>
            <tr><td style="${tdStyle()}">Md (kN·cm)</td><td style="${tdStyle()}">${num(Md_kNcm,2)}</td></tr>
            <tr><td style="${tdStyle()}">Kc (calc)</td><td style="${tdStyle()}">${Number.isFinite(Kc) ? Kc.toFixed(6) : "–"}</td></tr>
            <tr><td style="${tdStyle()}">Linha Tabela K</td><td style="${tdStyle()}">${opts.kIdxEscolhido != null ? `linha ${opts.kIdxEscolhido + 1}` : "–"}</td></tr>
            <tr><td style="${tdStyle()}">Bx</td><td style="${tdStyle()}">${Bx}</td></tr>
            <tr><td style="${tdStyle()}">ks</td><td style="${tdStyle()}">${ks}</td></tr>
            <tr><td style="${tdStyle()}">x</td><td style="${tdStyle()}">${typeof x === "number" ? `${num(x,3)} cm` : "–"}</td></tr>
            <tr><td style="${tdStyle()}">Verificação T</td><td style="${tdStyle()}">${ehT}</td></tr>
            <tr><td style="${tdStyle()}">As (cm²)</td><td style="${tdStyle()}">${As != null ? num(As,3) : "–"}</td></tr>
            <tr><td style="${tdStyle()}">As (adotar) cm²</td><td style="${tdStyle()}">${AsAdotar != null ? num(AsAdotar,3) : "–"}</td></tr>
            <tr><td style="${tdStyle()}">Arranjo</td><td style="${tdStyle()}">${arranjo}</td></tr>
          </tbody>
        </table>
      </section>
    `;
  } catch (err) {
    return `<section><h2>${titleCase(opts.title)}</h2><div>Erro ao gerar dados.</div></section>`;
  }
};

/* ============================
   Componente principal
   ============================ */
export default function LajeBiapoiadaPage() {
  /* ---------- Estados principais ---------- */
  const [trelicaKey, setTrelicaKey] =
    useState<KeyOf<typeof TRELICAS>>("TR12645");
  const [concretoKey, setConcretoKey] =
    useState<KeyOf<typeof CONCRETOS>>("C30");
  const [acoKey, setAcoKey] = useState<KeyOf<typeof ACOS>>("CA50");

  const LxInput = useNumberInput(5.30, 0.1);
  const LyInput = useNumberInput(3.85, 0.1);
  const LmanualInput = useNumberInput(3.85, 0.01);

  const qBaseInput = useNumberInput(5.0, 0.01);
  // padrão desligado (conforme solicitação anterior)
  const [usarPP, setUsarPP] = useState<boolean>(false);

  const [kIdxEscolhido, setKIdxEscolhido] = useState<number | null>(null);
  const [selN, setSelN] = useState<number | null>(null);
  const [selDiam, setSelDiam] = useState<number | null>(null);

  // trava sugestão
  const [lockedSuggestion, setLockedSuggestion] = useState<boolean>(false);
  const [lockedSuggestionIdx, setLockedSuggestionIdx] = useState<number | null>(
    null
  );

  // classe agressividade + override cobrimento
  const [agrClass, setAgrClass] = useState<AgrClass>("II"); // padrão Classe II (25 mm)
  const [overrideCoverCm, setOverrideCoverCm] = useState<number | null>(null); // cm

  // saved lajes
  const [savedLajes, setSavedLajes] = useState<any[]>([]);

  // refs
  const sugestaoLiveRef = useRef<HTMLDivElement | null>(null);
  const arranjoRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Carregar estado simples e saved ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const st = JSON.parse(raw);
        if (st.trelicaKey) setTrelicaKey(st.trelicaKey);
        if (st.concretoKey) setConcretoKey(st.concretoKey);
        if (st.acoKey) setAcoKey(st.acoKey);
        if (typeof st.Lx === "number") LxInput.setValue?.(st.Lx);
        if (typeof st.Ly === "number") LyInput.setValue?.(st.Ly);
        if (typeof st.L === "number") LmanualInput.setValue?.(st.L);
        if (typeof st.qBase === "number") qBaseInput.setValue?.(st.qBase);
        if (typeof st.usarPP === "boolean") setUsarPP(st.usarPP);
        if (typeof st.kIdxEscolhido === "number")
          setKIdxEscolhido(st.kIdxEscolhido);
        if (st.selN) setSelN(st.selN);
        if (st.selDiam) setSelDiam(st.selDiam);
        if (typeof st.lockedSuggestion === "boolean")
          setLockedSuggestion(st.lockedSuggestion);
        if (typeof st.lockedSuggestionIdx === "number")
          setLockedSuggestionIdx(st.lockedSuggestionIdx);
        if (st.agrClass) setAgrClass(st.agrClass);
        if (typeof st.overrideCoverCm === "number")
          setOverrideCoverCm(st.overrideCoverCm);
      }
    } catch (e) {
      // silent
    }

    try {
      const rawSaved = localStorage.getItem(STORAGE_SAVED_KEY);
      if (rawSaved) {
        const arr = JSON.parse(rawSaved);
        if (Array.isArray(arr)) setSavedLajes(arr);
      }
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistir preferências
  useEffect(() => {
    try {
      const toSave = {
        trelicaKey,
        concretoKey,
        acoKey,
        Lx: LxInput.value,
        Ly: LyInput.value,
        L: LmanualInput.value,
        qBase: qBaseInput.value,
        usarPP,
        kIdxEscolhido,
        selN,
        selDiam,
        lockedSuggestion,
        lockedSuggestionIdx,
        agrClass,
        overrideCoverCm,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // silent
    }
  }, [
    trelicaKey,
    concretoKey,
    acoKey,
    LxInput.value,
    LyInput.value,
    LmanualInput.value,
    qBaseInput.value,
    usarPP,
    kIdxEscolhido,
    selN,
    selDiam,
    lockedSuggestion,
    lockedSuggestionIdx,
    agrClass,
    overrideCoverCm,
  ]);

  /* ---------- Cálculos ---------- */
  const Lx = LxInput.value;
  const Ly = LyInput.value;
  const L = Math.min(
    LmanualInput.value,
    Math.max(0.0001, Math.min(Lx, Ly))
  );
  const menorVao: "Lx" | "Ly" | null =
    !isFinite(Lx) || !isFinite(Ly) ? null : Lx <= Ly ? "Lx" : "Ly";

  const tre = TRELICAS[trelicaKey] as TreExt;
  const conc = CONCRETOS[concretoKey] as any;
  const aco = ACOS[acoKey] as any;

  const bf_m = useMemo(() => tre.bf / 100, [tre.bf]);

  const gamma_conc = 25;
  const capa_m = tre.hf / 100;
  const nerv_m =
    (tre.bw * Math.max(0, tre.h - tre.hf) /*cm²*/ / 10000) / bf_m;
  const PP_kN_m2 = gamma_conc * (capa_m + nerv_m);
  const qTotal_kN_m2 = usarPP ? qBaseInput.value + PP_kN_m2 : qBaseInput.value;

  const qLinha = useMemo(() => qTotal_kN_m2 * bf_m, [qTotal_kN_m2, bf_m]);

  const Vk = useMemo(() => (qLinha * L) / 2, [qLinha, L]);
  const Mk_kNm = useMemo(() => (qLinha * L * L) / 8, [qLinha, L]);
  const Md_kNcm = useMemo(() => Mk_kNm * 1.4 * 100, [Mk_kNm]);

  const Kc = useMemo(() => {
    if (!isFinite(Md_kNcm) || Md_kNcm === 0) return NaN;
    return (tre.bw * tre.d * tre.d) / Md_kNcm;
  }, [tre.bw, tre.d, Md_kNcm]);

  // ---------------------------
  // índice sugerido (determinístico)
  // ---------------------------
  const kIdxSugerida = useMemo(() => {
    const colIndexKC = COL_CONCRETO[concretoKey];
    let menorDif = Infinity;
    let idxBest: number | null = null;

    for (let idx = 0; idx < TABELA_K.length; idx++) {
      const row = TABELA_K[idx];
      const raw = row[colIndexKC];
      if (raw === undefined || raw === null) continue;
      const valorKC = Number(String(raw));
      if (Number.isFinite(valorKC)) {
        const dif = Math.abs(valorKC - Kc);
        if (dif < menorDif) {
          menorDif = dif;
          idxBest = idx;
        }
      }
    }
    return idxBest;
  }, [Kc, concretoKey]);

  // linha escolhida atual
  const linha = useMemo(
    () => (kIdxEscolhido != null ? TABELA_K[kIdxEscolhido] : null),
    [kIdxEscolhido]
  );

  const Bx = linha ? getBx(linha) : undefined;
  const ks = linha ? getKs(linha, acoKey) : undefined;
  const x = Bx != null ? Bx * tre.d : undefined;
  const ehT = x != null ? x > 1.25 * tre.hf : undefined;

  const As = ks != null ? (ks * Md_kNcm) / tre.d : undefined;
  const AsAdotar = As != null ? Math.max(As - 0.4 /*cm²*/, 0) : undefined;

  const sminFromPhi = (phi_cm: number) =>
    Math.max(phi_cm, 2.0, (1.2 * D_AGG_DEFAULT) / 10);

  const phiBase_cm = (tre.arm?.base_mm ?? 5) / 10;

  // ==== cobrimento nominal usado (mm) + c_inf_cm (cm) ====
  const coverUsedMm = overrideCoverCm != null ? overrideCoverCm * 10 : DEFAULT_COVER_MM_FOR_LAJES[agrClass];
  const c_inf_cm = coverUsedMm / 10;

  const larguraDentro_cm = useMemo(
    () => larguraUtilDentro(tre, c_inf_cm, phiBase_cm),
    [tre, c_inf_cm, phiBase_cm]
  );

  const candidatas = useMemo(() => {
    const out: { n: number; diam: number; area: number }[] = [];
    for (const diam of DIAMETROS_PADRAO) {
      const areas = TABELA_ACO[diam];
      areas?.forEach((a: number, i: number) => {
        out.push({ n: i + 1, diam, area: a });
      });
    }
    return out;
  }, []);

  // ===== inclui checagens da NBR: c_nom >= ø_barra e d_max <= 1.2*c_nom (agregado) ====
  const { cabem, naoCabem } = useMemo(() => {
    const resultCabem: Sugestao[] = [];
    const resultNao: Sugestao[] = [];
    if (AsAdotar == null) return { cabem: resultCabem, naoCabem: resultNao };
    const largura = larguraDentro_cm;
    const c_nom_mm = coverUsedMm; // mm
    for (const c of candidatas) {
      if (c.area < AsAdotar - 1e-9) continue;
      const phi_cm = c.diam / 10;
      const smin = sminFromPhi(phi_cm);
      const Locup = L_ocupado_cm(c.n, phi_cm, smin);
      const spacingOk = Locup <= largura + 1e-9;

      // checagem cobrimento vs bitola (c_nom >= ø_barra)
      const phi_mm = c.diam; // diam in mm
      const coverOk = c_nom_mm >= phi_mm;

      // checagem agregado: d_max <= 1.2 * c_nom
      const aggOk = D_AGG_DEFAULT <= 1.2 * c_nom_mm;

      const cabe = spacingOk && coverOk && aggOk;

      let reason: string | null = null;
      if (!spacingOk) reason = "Não cabe geometricamente (L ocupado > largura útil).";
      else if (!coverOk) reason = `Cobrimento (c_nom=${c_nom_mm} mm) < ø bitola (${phi_mm} mm).`;
      else if (!aggOk) reason = `Tamanho agregado (d_max=${D_AGG_DEFAULT} mm) > 1.2·c_nom (${(1.2*c_nom_mm).toFixed(1)} mm).`;

      const sug: Sugestao = {
        n: c.n,
        diam: c.diam,
        area: c.area,
        sobra: c.area - AsAdotar,
        cabe,
        L: Locup,
        reason,
      };
      (cabe ? resultCabem : resultNao).push(sug);
    }
    resultCabem.sort((a, b) => a.sobra - b.sobra || a.area - b.area);
    resultNao.sort((a, b) => a.sobra - b.sobra || a.area - b.area);
    return { cabem: resultCabem, naoCabem: resultNao };
  }, [AsAdotar, larguraDentro_cm, candidatas, coverUsedMm]);

  // se arranjo selecionado deixou de caber, limpa seleção
  useEffect(() => {
    if (!selN || !selDiam) return;
    const found = cabem.find((s) => s.n === selN && s.diam === selDiam);
    if (!found) {
      setSelN(null);
      setSelDiam(null);
    }
  }, [cabem, selN, selDiam]);

  // anuncie via aria-live quando a sugestão mudar
  useEffect(() => {
    if (!sugestaoLiveRef.current) return;
    const txt =
      kIdxSugerida != null ? `Linha sugerida: ${kIdxSugerida + 1}` : "Nenhuma linha sugerida";
    sugestaoLiveRef.current.textContent = txt;
  }, [kIdxSugerida]);

  /* ---------- Trava sugestão logic ---------- */
  useEffect(() => {
    if (lockedSuggestion) {
      if (lockedSuggestionIdx == null && kIdxSugerida != null) {
        setLockedSuggestionIdx(kIdxSugerida);
        setKIdxEscolhido(kIdxSugerida);
      }
      if (lockedSuggestionIdx != null) {
        setKIdxEscolhido(lockedSuggestionIdx);
      }
    } else {
      if (lockedSuggestionIdx != null) setLockedSuggestionIdx(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedSuggestion, kIdxSugerida]);

  /* ---------- Callbacks ---------- */
  const selecionar = useCallback((s: Sugestao) => {
    if (!s.cabe) {
      alert(s.reason ?? "Esta combinação não é válida conforme regras (verifique cobrimento/aggregado/espacamento).");
      return;
    }
    if (lockedSuggestion) {
      setLockedSuggestion(false);
      setLockedSuggestionIdx(null);
    }
    setSelN(s.n);
    setSelDiam(s.diam);
  }, [lockedSuggestion]);

  const handleRowSelect = useCallback((idx: number) => {
    if (lockedSuggestion) {
      setLockedSuggestion(false);
      setLockedSuggestionIdx(null);
    }
    setKIdxEscolhido(idx);
  }, [lockedSuggestion]);

  const onRowKeyDown = useCallback((e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowSelect(idx);
    }
    if (e.key === "ArrowDown") {
      const next = Math.min(idx + 1, TABELA_K.length - 1);
      const el = document.getElementById(`krow-${next}`);
      (el as HTMLElement | null)?.focus();
    }
    if (e.key === "ArrowUp") {
      const prev = Math.max(idx - 1, 0);
      const el = document.getElementById(`krow-${prev}`);
      (el as HTMLElement | null)?.focus();
    }
  }, [handleRowSelect]);

  // ============================
  // ROTINAS DE EXPORTAÇÃO (robustas, sem alerts de bloqueio)
  // ============================
  const buildFullHTML = useCallback(() => {
    const header = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Carimbo - Lajes</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:20px}
            h1{font-size:18px;margin-bottom:8px}
            h2{font-size:14px;margin:10px 0}
            table{width:100%;border-collapse:collapse;margin-bottom:10px}
            td,th{padding:6px;border:1px solid #ddd;font-size:12px}
            .meta{font-size:12px;color:#666;margin-bottom:12px}
            .laje-block{margin-bottom:18px}
            @media print { h1{page-break-after:avoid} section{page-break-inside:avoid} }
          </style>
        </head>
        <body>
          <h1>Carimbo — Lajes</h1>
          <div class="meta">Gerado em ${new Date().toLocaleString()}. Referência: NBR 6118 (Tabela 7.2) — cobrimentos por classe.</div>
    `;

    const currentHtml = renderSingleLajeHTML({
      title: "Laje atual",
      trelicaKey,
      concretoKey,
      acoKey,
      Lx,
      Ly,
      L,
      qBase: qBaseInput.value,
      usarPP,
      kIdxEscolhido,
      selN,
      selDiam,
      agrClass,
      coverOverrideCm: overrideCoverCm,
    });

    const savedHtml = savedLajes.length
      ? `<h2>Lajes salvas (${savedLajes.length})</h2>` +
        savedLajes
          .map((s) =>
            renderSingleLajeHTML({
              title: `${s.name}`,
              trelicaKey: s.trelicaKey,
              concretoKey: s.concretoKey,
              acoKey: s.acoKey,
              Lx: s.Lx,
              Ly: s.Ly,
              L: s.L,
              qBase: s.qBase,
              usarPP: s.usarPP,
              kIdxEscolhido: s.kIdxEscolhido,
              selN: s.selN,
              selDiam: s.selDiam,
              agrClass: s.agrClass ?? "II",
              coverOverrideCm: s.coverOverrideCm ?? null,
            })
          )
          .join("")
      : "<div class='meta'>Nenhuma laje salva.</div>";

    const footer = `</body></html>`;
    return header + `<div class="laje-block">${currentHtml}</div>` + savedHtml + footer;
  }, [
    trelicaKey, concretoKey, acoKey, Lx, Ly, L, qBaseInput.value, usarPP,
    kIdxEscolhido, selN, selDiam, savedLajes, agrClass, overrideCoverCm
  ]);

  // exporta HTML: abre nova janela, escreve e chama print; se bloqueado, baixa arquivo .html (silencioso)
  const exportCleanHTML = useCallback(() => {
    const full = buildFullHTML();

    // tentar abrir janela sincronicamente
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (w) {
      try {
        w.document.open();
        w.document.write(full);
        w.document.close();
        // onload print
        w.onload = () => {
          try {
            w.focus();
            w.print();
          } catch {
            /* silent */
          }
        };
        // fallback por segurança (sem alerts)
        setTimeout(() => {
          try {
            w.focus();
            w.print();
          } catch {
            /* silent */
          }
        }, 700);
        return;
      } catch (err) {
        console.warn("Falha ao escrever na janela aberta, gerando download HTML como fallback.", err);
      }
    }

    // fallback silencioso: gera download do .html
    try {
      const blob = new Blob([full], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lajes_carimbo_${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Falha no fallback exportCleanHTML:", e);
    }
  }, [buildFullHTML]);

  // export PDF: gera canvas do HTML (off-screen) e cria PDF com jspdf/html2canvas (fallback para download HTML)
  const exportPDF = useCallback(async () => {
    const full = buildFullHTML();
    // cria elemento temporário off-screen para renderizar o HTML
    const temp = document.createElement("div");
    temp.style.position = "fixed";
    temp.style.left = "-9999px";
    temp.style.top = "0";
    temp.style.width = "1200px"; // largura maior para melhor render
    temp.innerHTML = full;
    document.body.appendChild(temp);

    try {
      const html2canvasMod = await import("html2canvas");
      const html2canvas = html2canvasMod.default ?? html2canvasMod;
      const jspdfMod = await import("jspdf");
      const { jsPDF } = jspdfMod as any;

      // renderiza
      const canvas = await html2canvas(temp as HTMLElement, { scale: 2 });
      const img = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth() - 72; // margem
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.text("Carimbo — Lajes", 40, 40);
      pdf.addImage(img, "PNG", 36, 60, pageWidth, pageHeight);
      pdf.save(`lajes_carimbo_${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`);
    } catch (err) {
      console.error("Erro exportPDF (html2canvas/jsPDF):", err);
      // fallback silencioso para download HTML
      try {
        const blob = new Blob([full], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lajes_carimbo_${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Falha no fallback exportPDF:", e);
      }
    } finally {
      try { document.body.removeChild(temp); } catch {}
    }
  }, [buildFullHTML]);

  /* ---------- Saved laje functions ---------- */
  const persistSavedLajes = useCallback((arr: any[]) => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(arr));
      setSavedLajes(arr);
    } catch {
      // silent
    }
  }, []);

  const saveCurrentLaje = useCallback(() => {
    const name = String(
      prompt("Nome da laje (ex: Laje 101). Deixe em branco para cancelar:") ?? ""
    ).trim();
    if (!name) return;

    const item = {
      name,
      trelicaKey,
      concretoKey,
      acoKey,
      Lx,
      Ly,
      L,
      qBase: qBaseInput.value,
      usarPP,
      kIdxEscolhido,
      selN,
      selDiam,
      Kc: Number.isFinite(Kc) ? Kc : undefined,
      createdAt: new Date().toISOString(),
      agrClass,
      coverOverrideCm: overrideCoverCm,
    };

    const next = [...savedLajes, item];
    persistSavedLajes(next);
    alert(`Laje "${name}" salva (${next.length} total).`);
  }, [
    trelicaKey,
    concretoKey,
    acoKey,
    Lx,
    Ly,
    L,
    qBaseInput.value,
    usarPP,
    kIdxEscolhido,
    selN,
    selDiam,
    Kc,
    savedLajes,
    persistSavedLajes,
    agrClass,
    overrideCoverCm,
  ]);

  const deleteSaved = useCallback((idx: number) => {
    const copy = [...savedLajes];
    copy.splice(idx, 1);
    persistSavedLajes(copy);
  }, [savedLajes, persistSavedLajes]);

  const exportSavedAsHTML = useCallback((item: any) => {
    const header = `
      <html>
        <head><meta charset="utf-8"/><title>Carimbo — ${item.name}</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111}
            h1{font-size:18px;margin-bottom:8px}
            table{width:100%;border-collapse:collapse;margin-top:8px}
            td,th{padding:6px;border:1px solid #ddd;text-align:left;font-size:12px}
          </style>
        </head>
        <body>
          <h1>Carimbo — ${item.name}</h1>
          <div style="font-size:12px;color:#666;margin-bottom:6px">Salvo em ${new Date(item.createdAt).toLocaleString()}</div>
    `;
    const body = renderSingleLajeHTML({
      title: item.name,
      trelicaKey: item.trelicaKey,
      concretoKey: item.concretoKey,
      acoKey: item.acoKey,
      Lx: item.Lx,
      Ly: item.Ly,
      L: item.L,
      qBase: item.qBase,
      usarPP: item.usarPP,
      kIdxEscolhido: item.kIdxEscolhido,
      selN: item.selN,
      selDiam: item.selDiam,
      agrClass: item.agrClass ?? "II",
      coverOverrideCm: item.coverOverrideCm ?? null,
    });
    const footer = "</body></html>";
    const full = header + body + footer;

    // tentar abrir janela e imprimir (sincrono). Se não abrir -> download silencioso.
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (w) {
      try {
        w.document.open();
        w.document.write(full);
        w.document.close();
        setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
        return;
      } catch (err) {
        console.warn("Falha ao abrir/escrever janela (exportSavedAsHTML). Gerando download como fallback.", err);
      }
    }

    try {
      const blob = new Blob([full], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.name.replace(/\s+/g,"_")}_${new Date().toISOString().replace(/[:.]/g,"-")}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Falha no fallback exportSavedAsHTML:", e);
    }
  }, []);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <InternalHeader title="Laje Biapoiada" showBackButton backHref="/calculadoras" />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* =========================
            Top area: 3 cards x 2 linhas:
           ========================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Geometria */}
          <div className="card p-4">
            <h2 className="font-bold mb-3">Geometria da laje (Lx × Ly)</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Lx (m)
                <input
                  type="text"
                  aria-label="Lx em metros"
                  value={String(LxInput.value)}
                  onChange={(e) => LxInput.onChange(e.target.value)}
                  onBlur={() => LxInput.onBlurValidate()}
                  className={`mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)] ${LxInput.error ? "border-red-600" : ""}`}
                  aria-describedby={LxInput.error ? "err-lx" : undefined}
                />
                {LxInput.error && <div id="err-lx" role="alert" className="text-xs text-red-600 mt-1">{LxInput.error}</div>}
              </label>
              <label className="text-sm">
                Ly (m)
                <input
                  type="text"
                  aria-label="Ly em metros"
                  value={String(LyInput.value)}
                  onChange={(e) => LyInput.onChange(e.target.value)}
                  onBlur={() => LyInput.onBlurValidate()}
                  className={`mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)] ${LyInput.error ? "border-red-600" : ""}`}
                  aria-describedby={LyInput.error ? "err-ly" : undefined}
                />
                {LyInput.error && <div id="err-ly" role="alert" className="text-xs text-red-600 mt-1">{LyInput.error}</div>}
              </label>
            </div>
            <div className="mt-3">
              <label className="text-sm">
                L (m) (menor vão ou override)
                <input
                  type="text"
                  aria-label="L adotado em metros"
                  value={String(LmanualInput.value)}
                  onChange={(e) => LmanualInput.onChange(e.target.value)}
                  onBlur={() => LmanualInput.onBlurValidate()}
                  className={`mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)] ${LmanualInput.error ? "border-red-600" : ""}`}
                  aria-describedby={LmanualInput.error ? "err-l" : undefined}
                />
                {LmanualInput.error && <div id="err-l" role="alert" className="text-xs text-red-600 mt-1">{LmanualInput.error}</div>}
              </label>
            </div>

            <div className="mt-3 text-sm">
              Menor vão adotado: <b>{num(L, 2)} m</b> ({menorVao ?? "—"})
            </div>
          </div>

          {/* Concreto */}
          <div className="card p-4">
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
            <div className="mt-2 text-sm opacity-80">fcd: <b>{num(conc.fcd, 3)}</b></div>
          </div>

          {/* Aço */}
          <div className="card p-4">
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
            <div className="mt-2 text-sm opacity-80">fyd: <b>{num(aco.fyd, 3)}</b></div>
          </div>

          {/* Treliça */}
          <div className="card p-4">
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
            <div className="mt-2 text-sm opacity-80 grid grid-cols-1 gap-y-1">
              <div>bw: <b>{tre.bw} cm</b></div>
              <div>bf: <b>{tre.bf} cm</b></div>
              <div>h: <b>{tre.h} cm</b></div>
              <div>hf: <b>{tre.hf} cm</b></div>
              <div>d: <b>{tre.d} cm</b></div>
              <div>φbase: <b>{((tre.arm?.base_mm ?? 5) / 10).toFixed(2)} cm</b></div>
            </div>
          </div>

          {/* Carregamento */}
          <div className="card p-4">
            <h2 className="font-bold mb-1">Carregamento</h2>
            <label className="text-sm block mb-2">
              q<sub>base</sub> (kN/m²)
              <input
                type="text"
                aria-label="q base em kN por metro quadrado"
                value={String(qBaseInput.value)}
                onChange={(e) => qBaseInput.onChange(e.target.value)}
                onBlur={() => qBaseInput.onBlurValidate()}
                className={`mt-1 w-full border rounded-lg px-3 py-2 bg-[var(--color-card)] ${qBaseInput.error ? "border-red-600" : ""}`}
                aria-describedby={qBaseInput.error ? "err-q" : undefined}
              />
              {qBaseInput.error && <div id="err-q" role="alert" className="text-xs text-red-600 mt-1">{qBaseInput.error}</div>}
            </label>

            <div className="mt-2 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={usarPP} onChange={(e) => setUsarPP(e.target.checked)} />
                Somar PP estimado da LT
              </label>
              <div className="opacity-80 mt-2">PP ≈ <b>{num(PP_kN_m2, 3)}</b> kN/m²</div>
              <div className="mt-1">q<sub>total</sub> = <b>{num(qTotal_kN_m2, 3)}</b> kN/m²</div>
              <div className="opacity-80 mt-1">bf = <b>{num(bf_m, 2)}</b> m → q' = <b>{num(qLinha, 3)}</b> kN/m</div>

              {/* Classe agressividade + override cobrimento */}
              <div className="mt-3">
                <label className="block text-xs mb-1 font-medium">Classe de agressividade (NBR 6118 — tabela 7.2) <span title="Tabela 7.2 — cobrimentos por classe (NBR 6118)">ℹ️</span></label>
                <div className="flex gap-2">
                  <select value={agrClass} onChange={(e)=> setAgrClass(e.target.value as AgrClass)} className="w-1/2 border rounded px-2 py-2 bg-[var(--color-card)] text-sm">
                    {AGR_CLASSES.map(c => <option key={c} value={c}>Classe {c}</option>)}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="override (cm)"
                    value={overrideCoverCm ?? ""}
                    onChange={(e)=> setOverrideCoverCm(e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-1/2 border rounded px-2 py-2 bg-[var(--color-card)] text-sm"
                    title="Override do cobrimento nominal final em cm. Deixe vazio para usar o valor da NBR."
                  />
                </div>
                <div className="text-xs opacity-70 mt-1">
                  Cobrimento usado: <b>{coverUsedMm} mm</b> (Classe {agrClass}{overrideCoverCm ? ` — override ${overrideCoverCm} cm` : ""})
                </div>
                <div className="text-xs opacity-60 mt-1">Nota: assegure que c_nom ≥ ø da barra e d_max ≤ 1.2·c_nom; o sistema valida automaticamente as combinações.</div>
              </div>
            </div>
          </div>

          {/* Esforços ELU */}
          <div className="card p-4">
            <div className="text-sm opacity-70">Esforços (ELU)</div>
            <div>Vk = <b>{num(Vk, 3)}</b> kN</div>
            <div>Mk = <b>{num(Mk_kNm, 3)}</b> kN·m</div>
            <div>Md = <b>{num(Md_kNcm, 1)}</b> kN·cm</div>
            <div className="mt-2">Kc = <b>{num(Kc, 3)}</b></div>
          </div>
        </section>

        {/* tabela K + coluna direita (cards). OBS: sugestões e arranjo agora dentro da coluna direita */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold">Tabela K — clique na linha a adotar</h2>
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      Sugerida: <span className="px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-900">
                        {kIdxSugerida != null ? `linha ${kIdxSugerida + 1}` : "—"}
                      </span>{" "}
                      (Kc ≈ {num(Kc, 3)})
                    </div>

                    <div>
                      {lockedSuggestion ? (
                        <button
                          onClick={() => { setLockedSuggestion(false); setLockedSuggestionIdx(null); }}
                          title="Destravar sugestão"
                          className="px-2 py-1 rounded border bg-red-50 text-sm"
                        >
                          🔒 Sugestão travada (destravar)
                        </button>
                      ) : (
                        <button
                          onClick={() => setLockedSuggestion(true)}
                          title="Travar sugestão atual"
                          className="px-2 py-1 rounded border bg-green-50 text-sm"
                        >
                          🔓 Travar sugestão
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div role="region" aria-live="polite" ref={sugestaoLiveRef} className="sr-only" />

                <div className="overflow-auto rounded-xl border" role="table" aria-label="Tabela K interativa">
                  <div role="row" className="grid grid-cols-3 gap-2 p-2 font-bold bg-slate-50">
                    <div role="columnheader">Bx</div>
                    <div role="columnheader">{concretoKey} (kc)</div>
                    <div role="columnheader">{acoKey} (ks)</div>
                  </div>

                  {TABELA_K.map((row: any, i: number) => {
                    const isSug = i === kIdxSugerida;
                    const isSel = i === kIdxEscolhido;
                    const rowCls = isSel ? "bg-cyan-100" : isSug ? "bg-yellow-100" : "hover:bg-cyan-50";
                    return (
                      <div
                        id={`krow-${i}`}
                        role="button"
                        tabIndex={0}
                        key={i}
                        onClick={() => handleRowSelect(i)}
                        onKeyDown={(e) => onRowKeyDown(e as any, i)}
                        aria-pressed={isSel}
                        aria-describedby={isSug ? "sugestao-desc" : undefined}
                        className={`grid grid-cols-3 gap-2 p-2 items-center cursor-pointer ${rowCls}`}
                      >
                        <div role="cell">{getBx(row)}</div>
                        <div role="cell">{getKc(row, concretoKey) ?? "–"}</div>
                        <div role="cell">{getKs(row, acoKey) ?? "–"}</div>
                      </div>
                    );
                  })}
                </div>

                <div id="sugestao-desc" className="sr-only">
                  Linha sugerida automaticamente com base no Kc calculado.
                </div>

                {!linha && (
                  <p className="mt-2 text-sm opacity-80">
                    ➜ Clique na linha <b>amarela</b> (sugerida) para preencher <b>Bx</b> e <b>ks</b>.
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <div className="card p-4">
                <div>Bx = <b>{num(Bx ?? undefined, 3)}</b></div>
                <div>ks = <b>{ks != null ? num(ks, 3) : "–"}</b></div>
                <div className="mt-2">x = Bx·d = <b>{num(x ?? undefined, 3)}</b> cm</div>
                <div className="mt-1">Verif. T: <b>{ehT ? "T verdadeira" : "retângulo eq."}</b></div>
              </div>

              <div className="card p-4">
                <div className="font-semibold mb-1">Armadura (método ks)</div>
                <div>As = ks·Md/d = <b>{num(As ?? undefined, 3)}</b> cm²</div>
                <div>Desconto treliça (0,40): <b>0,40</b></div>
                <div>As (adotar) = <b>{num(AsAdotar ?? undefined, 3)}</b> cm²</div>
              </div>

              <div className="card p-4">
                <div className="text-sm opacity-70">Largura útil (dentro)</div>
                <div><b>{num(larguraDentro_cm, 2)} cm</b></div>
                <div className="mt-2 text-xs opacity-80">Cobrimento nominal usado: <b>{coverUsedMm} mm</b></div>
              </div>

              {/* -- Sugestões CABEM colocadas abaixo da Largura útil (direita) -- */}
              {linha && (
                <div className="card p-4" style={{ maxHeight: 320, overflowY: "auto" }}>
                  <h3 className="font-semibold mb-2">Sugestões (CABEM) — ordem econômica</h3>
                  {cabem.length === 0 ? (
                    <div className="text-sm opacity-70">Nenhuma combinação atende e cabe nessa posição.</div>
                  ) : (
                    <ul className="space-y-2">
                      {cabem.slice(0, 12).map((s, i) => {
                        const phi_cm = s.diam / 10;
                        const smin = sminFromPhi(phi_cm);
                        const label = `${descArranjo(s.n, s.diam)} — área ≈ ${num(s.area, 2)} cm², L = ${num(s.L, 2)} cm → CABE`;
                        const selected = selN === s.n && selDiam === s.diam;
                        return (
                          <li key={i}>
                            <button
                              onClick={() => selecionar(s)}
                              className={`w-full text-left px-3 py-2 rounded-lg border ${selected ? "bg-cyan-100 border-cyan-300" : "hover:bg-cyan-50"}`}
                              aria-pressed={selected}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{descArranjo(s.n, s.diam)}</span>
                                <span className="text-xs opacity-70">s<sub>min</sub>={num(smin,2)} cm</span>
                              </div>
                              <div className="text-sm opacity-90">{label}</div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {/* -- Arranjo selecionado: se houver espaço será exibido logo abaixo das sugestões -- */}
              {linha && (
                <div ref={arranjoRef} className="card p-4">
                  <div className="font-semibold mb-2">Arranjo selecionado: {selN && selDiam ? descArranjo(selN, selDiam) : "—"}</div>
                  <div className="text-sm grid grid-cols-1 md:grid-cols-1 gap-2 opacity-90">
                    <div>Posição: <b>dentro da mesa</b></div>
                    <div>Largura disponível: <b>{num(larguraDentro_cm, 2)} cm</b></div>
                    <div>q<sub>total</sub> = <b>{num(qTotal_kN_m2, 3)}</b> kN/m²</div>

                    <div className="mt-2 flex flex-col gap-2">
                      <button onClick={exportPDF} className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white">Exportar PDF</button>
                      <button onClick={exportCleanHTML} className="px-4 py-2 rounded-lg border">Imprimir HTML limpo</button>
                      <button onClick={saveCurrentLaje} className="px-4 py-2 rounded-lg border">Salvar laje</button>
                    </div>
                  </div>
                </div>
              )}

              {/* -- Lista de lajes salvas (abaixo do arranjo selecionado) -- */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Lajes salvas</h3>
                  <div className="text-xs opacity-70">{savedLajes.length} salvas</div>
                </div>

                {savedLajes.length === 0 ? (
                  <div className="text-sm opacity-70">Nenhuma laje salva.</div>
                ) : (
                  <ul className="space-y-2">
                    {savedLajes.map((s, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs opacity-70">{new Date(s.createdAt).toLocaleString()} — {s.kIdxEscolhido != null ? `linha ${s.kIdxEscolhido + 1}` : "—"}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => exportSavedAsHTML(s)} className="px-2 py-1 rounded border text-xs">Exportar</button>
                          <button onClick={() => { if (confirm(`Remover laje "${s.name}"?`)) deleteSaved(i); }} className="px-2 py-1 rounded border text-xs">Excluir</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
// ========================= END FILE =========================
