export type TreExt = {
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

export const D_AGG_DEFAULT = 19;

export const L_ocupado_cm = (n: number, phi_cm: number, smin_cm: number) =>
  n * phi_cm + (n - 1) * smin_cm;

export const larguraUtilDentro = (
  tre: TreExt,
  c_inf_cm: number,
  phi_base_cm: number
) => tre.bw - 2 * c_inf_cm - 2 * phi_base_cm;

export const descArranjo = (n: number, diam: number) => `${n}Ø${diam}`;

export const sminFromPhi = (phi_cm: number, dAgg_mm = D_AGG_DEFAULT) =>
  Math.max(phi_cm, 2.0, (1.2 * dAgg_mm) / 10);

export const calculaPP = (tre: TreExt, gamma_conc = 25) => {
  const bf_m = tre.bf / 100;
  const capa_m = tre.hf / 100;
  const nerv_m = (tre.bw * Math.max(0, tre.h - tre.hf) / 10000) / bf_m;
  const PP_kN_m2 = gamma_conc * (capa_m + nerv_m);
  return { bf_m, PP_kN_m2 };
};

export const calcQLinha = (qTotal_kN_m2: number, bf_m: number) =>
  qTotal_kN_m2 * bf_m;

export const calcEsforcos = (L: number, qLinha: number) => {
  const Vk = (qLinha * L) / 2;
  const Mk_kNm = (qLinha * L * L) / 8;
  const Md_kNcm = Mk_kNm * 1.4 * 100;
  return { Vk, Mk_kNm, Md_kNcm };
};
