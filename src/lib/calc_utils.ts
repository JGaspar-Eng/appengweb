// src/lib/calc_utils.ts

import { GAMMA_C, GAMMA_S, LARGURA_FAIXA } from "@/components/constantes";

export type Trelica = {
  bw: number; // cm
  bf: number; // cm
  h: number;  // cm
  hf: number; // cm
  d: number;  // cm
};

export function calcFcd(fck_MPa: number, gammaC: number = GAMMA_C): number {
  return (fck_MPa / gammaC) / 10; // kN/cm²
}

export function calcFyd(fyk_MPa: number, gammaS: number = GAMMA_S): number {
  return (fyk_MPa / gammaS) / 10; // kN/cm²
}

export function calcQ(qprima_kN_m2: number, larguraFaixa_m: number = LARGURA_FAIXA): number {
  return qprima_kN_m2 * larguraFaixa_m; // kN/m
}

export function calcVk(q_kN_m: number, L_m: number): number {
  return (q_kN_m * L_m) / 2; // kN
}

export function calcMk(q_kN_m: number, L_m: number): number {
  return (q_kN_m * L_m * L_m) / 8; // kN·m
}

export function calcMd(Mk_kN_m: number, gammaF: number = 1.4): number {
  return Mk_kN_m * gammaF * 100; // kN·cm
}

export function calcKc(bw_cm: number, d_cm: number, Md_kN_cm: number): number {
  if (Md_kN_cm <= 0) throw new Error("Md deve ser > 0");
  return (bw_cm * d_cm * d_cm) / Md_kN_cm;
}

export function calcX(bx: number, d_cm: number): number {
  return bx * d_cm; // cm
}

export function isSecaoTValida(x_cm: number, hf_cm: number): boolean {
  return x_cm > 1.25 * hf_cm;
}

export function round3(v: number): number { return Math.round(v * 1000) / 1000; }
export function round4(v: number): number { return Math.round(v * 10000) / 10000; }

export type EntradaCaso = {
  trelica: Trelica;       // {bw,bf,h,hf,d}
  fck: number;            // MPa
  fyk: number;            // MPa
  vao_m: number;          // L em m
  qprima_kN_m2: number;   // kN/m² (editável; default 5)
};

export type SaidaCasoParcial = {
  fcd_kN_cm2: number;
  fyd_kN_cm2: number;
  q_kN_m: number;
  Vk_kN: number;
  Mk_kN_m: number;
  Md_kN_cm: number;
  Kc: number;
};

export function pipelineAteKc(entrada: EntradaCaso): SaidaCasoParcial {
  const { trelica, fck, fyk, vao_m, qprima_kN_m2 } = entrada;
  const fcd = calcFcd(fck);
  const fyd = calcFyd(fyk);
  const q = calcQ(qprima_kN_m2);
  const Vk = calcVk(q, vao_m);
  const Mk = calcMk(q, vao_m);
  const Md = calcMd(Mk);
  const Kc = calcKc(trelica.bw, trelica.d, Md);

  return {
    fcd_kN_cm2: round4(fcd),
    fyd_kN_cm2: round4(fyd),
    q_kN_m: round4(q),
    Vk_kN: round3(Vk),
    Mk_kN_m: round3(Mk),
    Md_kN_cm: round3(Md),
    Kc: round3(Kc),
  };
}

export function posTabelaK(d_cm: number, hf_cm: number, ks: number, bx: number) {
  const x = calcX(bx, d_cm);
  const secaoTValida = isSecaoTValida(x, hf_cm);
  return { x_cm: round3(x), secaoTValida };
}
