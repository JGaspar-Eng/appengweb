"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import CargaLinearAlvenaria from "@/components/CargaLinearAlvenaria";
import TabelaK from "@/components/TabelaK";
import ArmaduraSugerida from "@/components/ArmaduraSugerida";
import { gerarPDF } from "@/utils/pdfGenerator";
import { salvarLocal, lerLocal } from "@/utils/persistencia";
import Link from "next/link";

// --- Constantes técnicas --- //
const TRELICAS = {
  "TR08": { bw: 9, bf: 42, h: 8, hf: 4, d: 6.5 },
  "TR12": { bw: 9, bf: 42, h: 12, hf: 4, d: 10.5 },
  "TR14": { bw: 9, bf: 42, h: 14, hf: 4, d: 12.5 },
  "TR16": { bw: 9, bf: 42, h: 16, hf: 4, d: 14.5 },
  "TR20": { bw: 9, bf: 42, h: 20, hf: 4, d: 18.5 },
  "TR25": { bw: 9, bf: 42, h: 25, hf: 4, d: 23.5 },
  "TR30": { bw: 9, bf: 42, h: 30, hf: 4, d: 28.5 },
};
const CONCRETOS = { "C20": 20, "C25": 25, "C30": 30, "C35": 35, "C40": 40, "C45": 45, "C50": 50 };
const ACOS = { "CA25": 250, "CA50": 500, "CA60": 600 };

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

export default function LajeContinua() {
  // Parâmetros principais
  const [trelica, setTrelica] = useState("TR12");
  const [concreto, setConcreto] = useState("C30");
  const [aco, setAco] = useState("CA50");
  const [vaos, setVaos] = useState(["3.0", "3.5", "3.0"]);
  const [mkManual, setMkManual] = useState(["", "", ""]);
  const [modoManualMk, setModoManualMk] = useState(false);
  const [carga, setCarga] = useState("5.0");
  const [cargaAlvenaria, setCargaAlvenaria] = useState([0, 0, 0]);
  const [showModalIdx, setShowModalIdx] = useState<number | null>(null);
  const [md, setMd] = useState(["", "", ""]);

  // Dados Tabela K (ks, bx)
  const [dadosTabelaK, setDadosTabelaK] = useState<{ ks?: number; bx?: number }[]>([{}, {}, {}]);
  // Referência para PDF
  const refRelatorio = useRef<HTMLDivElement>(null);

  // Dados geométricos
  const t = TRELICAS[trelica];
  const fck = CONCRETOS[concreto];
  const fcd = +(fck / 1.4).toFixed(3);
  const fyk = ACOS[aco];
  const fyd = +(fyk / 1.15).toFixed(3);

  // Cálculo dos vãos/momentos (replicando visual validado)
  const calculoVaos = useMemo(() => {
    return [0, 1, 2].map((idx) => {
      const qPrincipal = Number(carga.replace(",", "."));
      const cargaTotal = qPrincipal + (cargaAlvenaria[idx] ? Number(cargaAlvenaria[idx]) : 0);
      let Mk = 0, v = 0;
      if (modoManualMk) {
        Mk = Number(mkManual[idx].replace(",", "."));
        v = null;
      } else {
        v = Number(vaos[idx].replace(",", "."));
        Mk = +(cargaTotal * 0.42 * Math.pow(v, 2) / 8).toFixed(3);
      }
      let MdValue = +(Mk * 1.4 * 100).toFixed(3);
      if (md[idx] && !isNaN(Number(md[idx]))) MdValue = Number(md[idx]);
      const bw = t.bw, d = t.d;
      const Kc = MdValue !== 0 ? +(bw * Math.pow(d, 2) / MdValue).toFixed(3) : 0;
      const q = +(cargaTotal * 0.42).toFixed(3);
      const Vk = v ? +(q * v / 2).toFixed(3) : null;

      return { v, q, Vk, Mk, MdValue, Kc };
    });
  }, [vaos, mkManual, modoManualMk, carga, cargaAlvenaria, md, t.bw, t.d]);

  // Persistência automática
  useEffect(() => {
    const saved = lerLocal<any>("lajeContinuaPersist");
    if (saved) {
      setTrelica(saved.trelica);
      setConcreto(saved.concreto);
      setAco(saved.aco);
      setVaos(saved.vaos);
      setMkManual(saved.mkManual);
      setModoManualMk(saved.modoManualMk);
      setCarga(saved.carga);
      setCargaAlvenaria(saved.cargaAlvenaria);
      setMd(saved.md);
      setDadosTabelaK(saved.dadosTabelaK ?? [{}, {}, {}]);
    }
  }, []);
  useEffect(() => {
    salvarLocal("lajeContinuaPersist", {
      trelica, concreto, aco, vaos, mkManual, modoManualMk, carga, cargaAlvenaria, md, dadosTabelaK
    });
  }, [trelica, concreto, aco, vaos, mkManual, modoManualMk, carga, cargaAlvenaria, md, dadosTabelaK]);

  // Manipuladores
  function handleVaoChange(idx: number, value: string) {
    const n = [...vaos];
    n[idx] = value;
    setVaos(n);
  }
  function handleMkManualChange(idx: number, value: string) {
    const n = [...mkManual];
    n[idx] = value;
    setMkManual(n);
  }
  function handleMdChange(idx: number, value: string) {
    const n = [...md];
    n[idx] = value;
    setMd(n);
  }
  function handleCargaAlvenaria(idx: number, valor: number) {
    const c = [...cargaAlvenaria];
    c[idx] = Number(valor);
    setCargaAlvenaria(c);
    setShowModalIdx(null);
  }
  function handleSelecionarK(idxMomento: number, ks: number, bx: number) {
    setDadosTabelaK(prev => {
      const novo = [...prev];
      novo[idxMomento] = { ks, bx };
      return novo;
    });
  }

  // Resultados para Armadura Sugerida
  const resultados = useMemo(() => {
    // Só calcula se ks e bx preenchidos em todos
    if (dadosTabelaK.every(x => x.ks && x.bx)) {
      return {
        t,
        fcd,
        fyd,
        md: calculoVaos.map(v => v.MdValue),
        kc: calculoVaos.map(v => v.Kc)
      };
    }
    return null;
  }, [dadosTabelaK, t, fcd, fyd, calculoVaos]);

  return (
    <div className="max-w-5xl mx-auto mt-6 p-5 bg-gradient-to-tr from-slate-50 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl shadow-2xl">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="font-extrabold text-2xl text-cyan-900 dark:text-cyan-100 tracking-tight">Laje Contínua — Dimensionamento</h1>
        <Link href="/dashboard">
          <button className="bg-neutral-200 dark:bg-neutral-800 text-cyan-800 dark:text-cyan-100 px-3 py-1 rounded-lg shadow hover:bg-cyan-200 font-bold transition-all">Voltar para Dashboard</button>
        </Link>
      </div>

      {/* Seleção dos parâmetros principais */}
      <div className="flex flex-wrap gap-4 mb-1 items-center">
        <Field label="Treliça">
          <select className="w-28 border border-cyan-200 rounded-lg px-2 py-1 text-xs" value={trelica} onChange={e => setTrelica(e.target.value)}>
            {Object.keys(TRELICAS).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Concreto">
          <select className="w-24 border border-cyan-200 rounded-lg px-2 py-1 text-xs" value={concreto} onChange={e => setConcreto(e.target.value)}>
            {Object.keys(CONCRETOS).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Aço">
          <select className="w-24 border border-cyan-200 rounded-lg px-2 py-1 text-xs" value={aco} onChange={e => setAco(e.target.value)}>
            {Object.keys(ACOS).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Carga q' (kN/m²)">
          <input className="w-20 border border-cyan-200 rounded-lg px-2 py-1 text-xs"
            value={carga} onChange={e => setCarga(e.target.value)} type="number" min="0" step="0.01"/>
        </Field>
      </div>

      {/* Dados técnicos premium */}
      <div className="flex flex-wrap gap-5 mb-3 text-base font-semibold">
        <span><b>bw:</b> {t.bw} cm</span>
        <span><b>bf:</b> {t.bf} cm</span>
        <span><b>h:</b> {t.h} cm</span>
        <span><b>hf:</b> {t.hf} cm</span>
        <span><b>d:</b> {t.d} cm</span>
      </div>
      <div className="flex flex-wrap gap-5 mb-3 text-base">
        <span><b>fck:</b> {fck} MPa</span>
        <span><b>fcd:</b> {fcd} kN/cm²</span>
        <span><b>fyk:</b> {fyk} MPa</span>
        <span><b>fyd:</b> {fyd} kN/cm²</span>
      </div>

      {/* Switch modo manual de Mk */}
      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={modoManualMk}
          onChange={e => setModoManualMk(e.target.checked)}
          id="modoManualMk"
        />
        <label htmlFor="modoManualMk" className="text-sm font-semibold">
          Preencher momento (Mk) manualmente
        </label>
      </div>

      {/* Dados dos vãos ou momentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map(idx => (
          <div key={idx} className="bg-white dark:bg-neutral-900 rounded-xl p-3 shadow text-xs">
            <div className="flex justify-between items-center mb-1">
              <b>{!modoManualMk ? `Vão ${idx + 1}` : `Momento ${idx + 1}`}</b>
              <button
                className="flex items-center gap-1 text-cyan-800 dark:text-cyan-200 hover:text-cyan-500 text-xs"
                onClick={() => setShowModalIdx(idx)}
                title="Adicionar carga de parede"
              >
                <PlusCircle className="w-4 h-4" />
                Carga de alvenaria
              </button>
            </div>
            {!modoManualMk ? (
              <label className="block mb-1">Vão (m):
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20 ml-2"
                  value={vaos[idx]}
                  onChange={e => handleVaoChange(idx, e.target.value)}
                  step="0.01"
                />
              </label>
            ) : (
              <label className="block mb-1">Momento Mk{idx + 1} (kN·m):
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-24 ml-2"
                  value={mkManual[idx]}
                  onChange={e => handleMkManualChange(idx, e.target.value)}
                  step="0.01"
                />
              </label>
            )}
            <label className="block mb-1">Md (kN·cm):&nbsp;
              <input
                type="number"
                className="border rounded px-2 py-1 w-24 ml-2"
                value={md[idx]}
                onChange={e => handleMdChange(idx, e.target.value)}
                placeholder="auto"
                step="0.01"
              />
              <span className="ml-2 text-gray-500">deixe vazio para auto</span>
            </label>
            {cargaAlvenaria[idx] > 0 && (
              <div className="text-cyan-800 dark:text-cyan-100 mt-1">
                <b>Carga parede:</b> {cargaAlvenaria[idx]} kN/m
              </div>
            )}
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <span>q total: <b>{calculoVaos[idx].q}</b> kN/m</span>
              <span>Vk: <b>{calculoVaos[idx].Vk !== null ? calculoVaos[idx].Vk : "—"}</b> kN</span>
              <span>Mk: <b>{calculoVaos[idx].Mk}</b> kN·m</span>
              <span>Md: <b>{calculoVaos[idx].MdValue}</b> kN·cm</span>
              <span>Kc: <b>{calculoVaos[idx].Kc}</b></span>
            </div>
            {/* Modal de carga de alvenaria */}
            {showModalIdx === idx && (
              <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-2xl border w-fit">
                  <CargaLinearAlvenaria onConfirm={valor => handleCargaAlvenaria(idx, valor)} />
                  <button className="mt-2 px-3 py-1 rounded text-xs bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-400"
                    onClick={() => setShowModalIdx(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- Tabela K --- */}
      <TabelaK
        kcArr={calculoVaos.map(v => v.Kc)}
        onSelecionar={handleSelecionarK}
        dadosSelecionados={dadosTabelaK}
      />

      {/* --- Armadura sugerida --- */}
      {resultados && (
        <div ref={refRelatorio} id="relatorio-laje-continua">
          <ArmaduraSugerida
            resultados={resultados}
            dadosTabelaK={dadosTabelaK}
            hf={t.hf}
            d={t.d}
            fcd={fcd}
            fyd={fyd}
          />
        </div>
      )}

      {/* Botão PDF e Dashboard */}
      {resultados && (
        <div className="mt-6 flex gap-4">
          <button
            className="bg-cyan-700 hover:bg-cyan-900 text-white rounded-lg px-4 py-2 font-bold shadow"
            onClick={() => gerarPDF("relatorio-laje-continua", "Relatorio-Laje-Continua.pdf")}
          >
            Download PDF
          </button>
          <a href="#topo-pagina" className="text-cyan-700 hover:underline text-sm mt-3">Ir ao topo</a>
        </div>
      )}

      <footer className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-700 text-xs flex flex-wrap items-center justify-between gap-2">
        <div>
          CREA/PR 1234567-D | Eng. Joanez Gaspar Pinto Junior | Sistema Premium
        </div>
        <div className="flex gap-2 items-center">
          <span>{useNow()}</span>
          <span className="text-[8px] bg-cyan-800 text-white px-2 py-1 rounded">QR</span>
        </div>
      </footer>
    </div>
  );
}
