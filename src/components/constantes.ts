// constantes.ts
// -------------------------------------------------
// Fonte única de dados do sistema
// -------------------------------------------------

// -----------------------------
// Tipos
// -----------------------------
export type Trelica = {
  bw: number;
  bf: number;
  h: number;   // altura total da laje (cm) = h_trelica_cm + cobrimentos (2.5 sup + 1.5 inf)
  hf: number;  // espessura da capa (cm)
  d: number;   // altura útil (cm) – mantido conforme app (aprox. h - 1,5)
  // Novos metadados (opcionais) para detalhamento/ desenho:
  h_trelica_cm?: number; // altura da treliça (cm)
  arm?: {
    top_mm: number;   // diâmetro do banzo superior (mm)
    diag_mm: number;  // diâmetro das diagonais (mm)
    base_mm: number;  // diâmetro do banzo inferior (mm)
  };
  // opcional: rótulo amigável exibido no select (não afeta cálculos)
  displayName?: string;
};

export type Concreto = {
  fck: number; // MPa
  fcd: number; // kN/cm²
};

export type Aco = {
  fyk: number; // MPa
  fyd: number; // kN/cm²
};

// [Kc, C20, C25, C30, C35, C40, C45, C50, ks_CA25, ks_CA50, ks_CA60]
export type LinhaTabelaK = [
  number, number, number, number, number, number, number, number,
  number | null, number | null, number | null
];

// -----------------------------
// Índices da Tabela K (evitar números mágicos)
// -----------------------------
export const K_COL_KC = 0;
export const K_COL_KS = 1;
export const K_COL_BX = 8;

// -----------------------------
// Fatores de segurança
// -----------------------------
export const GAMMA_C = 1.4;
export const GAMMA_S = 1.15;

// -----------------------------
// Cobrimentos padrão (cm) — usados no cálculo de h total (informativo)
// -----------------------------
export const C_SUP_PADRAO_CM = 2.5;
export const C_INF_PADRAO_CM = 1.5;

// -----------------------------
// Concretos disponíveis
// -----------------------------
export const CONCRETOS: Record<string, Concreto> = {
  C20: { fck: 20, fcd: parseFloat(((20 / GAMMA_C) / 10).toFixed(3)) },
  C25: { fck: 25, fcd: parseFloat(((25 / GAMMA_C) / 10).toFixed(3)) },
  C30: { fck: 30, fcd: parseFloat(((30 / GAMMA_C) / 10).toFixed(3)) },
  C35: { fck: 35, fcd: parseFloat(((35 / GAMMA_C) / 10).toFixed(3)) },
  C40: { fck: 40, fcd: parseFloat(((40 / GAMMA_C) / 10).toFixed(3)) },
  C45: { fck: 45, fcd: parseFloat(((45 / GAMMA_C) / 10).toFixed(3)) },
  C50: { fck: 50, fcd: parseFloat(((50 / GAMMA_C) / 10).toFixed(3)) },
};

// -----------------------------
// Aços disponíveis
// -----------------------------
export const ACOS: Record<string, Aco> = {
  CA25: { fyk: 250, fyd: parseFloat(((250 / GAMMA_S) / 10).toFixed(3)) },
  CA50: { fyk: 500, fyd: parseFloat(((500 / GAMMA_S) / 10).toFixed(3)) },
  CA60: { fyk: 600, fyd: parseFloat(((600 / GAMMA_S) / 10).toFixed(3)) },
};

// -----------------------------
// Treliças (ABNT NBR 14859/14862 + seus critérios)
// h_total = h_trelica_cm + 2,5 (sup) + 1,5 (inf) = h_trelica_cm + 4
// d ≈ h - 1,5 (mantém compatibilidade com o app existente)
// bw/bf fixos conforme sua base (9 / 42)
// -----------------------------
export const TRELICAS: Record<string, Trelica> = {
  TR06644: {
    bw: 9, bf: 42,
    h_trelica_cm: 6, h: 10, hf: 4, d: 8.5,
    arm: { top_mm: 6.0, diag_mm: 4.2, base_mm: 4.2 },
  },
  TR08644: {
    bw: 9, bf: 42,
    h_trelica_cm: 8, h: 12, hf: 4, d: 10.5,
    arm: { top_mm: 6.0, diag_mm: 4.2, base_mm: 4.2 },
  },
  TR08645: {
    bw: 9, bf: 42,
    h_trelica_cm: 8, h: 12, hf: 4, d: 10.5,
    arm: { top_mm: 6.0, diag_mm: 4.2, base_mm: 5.0 },
  },
  TR12645: {
    bw: 9, bf: 42,
    h_trelica_cm: 12, h: 16, hf: 4, d: 14.5,
    arm: { top_mm: 6.0, diag_mm: 4.2, base_mm: 5.0 },
  },
  TR12646: {
    bw: 9, bf: 42,
    h_trelica_cm: 12, h: 16, hf: 4, d: 14.5,
    arm: { top_mm: 6.0, diag_mm: 4.2, base_mm: 6.0 },
  },
  TR16745: {
    bw: 9, bf: 42,
    h_trelica_cm: 16, h: 20, hf: 4, d: 18.5,
    arm: { top_mm: 7.0, diag_mm: 4.2, base_mm: 5.0 },
  },
  TR16746: {
    bw: 9, bf: 42,
    h_trelica_cm: 16, h: 20, hf: 4, d: 18.5,
    arm: { top_mm: 7.0, diag_mm: 4.2, base_mm: 6.0 },
  },
  TR20745: {
    bw: 9, bf: 42,
    h_trelica_cm: 20, h: 24, hf: 4, d: 22.5,
    arm: { top_mm: 7.0, diag_mm: 4.2, base_mm: 5.0 },
  },
  TR20756: {
    bw: 9, bf: 42,
    h_trelica_cm: 20, h: 24, hf: 4, d: 22.5,
    arm: { top_mm: 7.0, diag_mm: 5.0, base_mm: 6.0 },
  },
  TR25856: {
    bw: 9, bf: 42,
    h_trelica_cm: 25, h: 29, hf: 5, d: 27.5,
    arm: { top_mm: 8.0, diag_mm: 5.0, base_mm: 6.0 },
  },
  TR25857: {
    bw: 9, bf: 42,
    h_trelica_cm: 25, h: 29, hf: 5, d: 27.5,
    arm: { top_mm: 8.0, diag_mm: 5.0, base_mm: 7.0 },
  },
};

// -- Gerar displayName amigável automaticamente (se não estiver preenchido)
// LT é dado por h + hf (ex.: h=10, hf=4 -> LT14).
Object.entries(TRELICAS).forEach(([key, tr]) => {
  if (tr && !tr.displayName) {
    const hVal = Number.isFinite(tr.h) ? tr.h : (tr.h_trelica_cm ?? 0);
    const hfVal = Number.isFinite(tr.hf) ? tr.hf : C_SUP_PADRAO_CM;
    const lt = Math.round(hVal + hfVal);
    tr.displayName = `${key} — LT${lt} (${hVal} + ${hfVal})`;
  }
});

// -----------------------------
// Helpers para gerar tabelas
// -----------------------------
export const gerarTabelaAco = (diametros: number[], maxBarras = 10) => {
  const tabela: Record<number, number[]> = {};
  diametros.forEach(diam => {
    const area = parseFloat(((Math.PI * (diam / 10) ** 2) / 4).toFixed(3)); // cm²
    tabela[diam] = Array.from({ length: maxBarras }, (_, i) =>
      parseFloat(((i + 1) * area).toFixed(3))
    );
  });
  return tabela;
};

export const gerarBitolas = (diametros: number[]) => {
  return diametros.map(diam => ({
    diam,
    area: parseFloat(((Math.PI * (diam / 10) ** 2) / 4).toFixed(3)) // cm²
  }));
};

// -----------------------------
// Bitolas e Tabela de aço
// -----------------------------
export const DIAMETROS_PADRAO = [5, 6.3, 8, 10, 12.5, 16, 20, 25, 32] as const;

export const BITOLAS = gerarBitolas([...DIAMETROS_PADRAO]);
export const AREA_BY_DIAM: Record<number, number> = Object.fromEntries(
  BITOLAS.map(b => [b.diam, b.area])
) as Record<number, number>;

export const TABELA_ACO = gerarTabelaAco([...DIAMETROS_PADRAO]);

// -----------------------------
// Tabela K (mantida conforme norma) – NÃO ALTERAR
// -----------------------------
export const TABELA_K: LinhaTabelaK[] = [
  [0.02, 51.9, 41.5, 34.6, 29.6, 25.9, 23.1, 20.8, 0.046, 0.023, 0.019],
  [0.04, 26.2, 20.9, 17.4, 14.9, 13.1, 11.6, 10.5, 0.047, 0.023, 0.019],
  [0.06, 17.6, 14.1, 11.7, 10.0, 8.8, 7.8, 7.0, 0.047, 0.024, 0.019],
  [0.08, 13.3, 10.6, 8.9, 7.6, 6.6, 5.9, 5.3, 0.048, 0.024, 0.020],
  [0.10, 10.7, 8.6, 7.1, 6.1, 5.4, 4.8, 4.3, 0.048, 0.024, 0.020],
  [0.12, 9.0, 7.2, 6.0, 5.1, 4.5, 4.0, 3.6, 0.048, 0.024, 0.020],
  [0.14, 7.8, 6.2, 5.2, 4.5, 3.9, 3.5, 3.1, 0.049, 0.024, 0.020],
  [0.16, 6.9, 5.5, 4.6, 3.9, 3.4, 3.1, 2.7, 0.049, 0.025, 0.020],
  [0.18, 6.2, 4.9, 4.1, 3.5, 3.1, 2.7, 2.5, 0.050, 0.025, 0.021],
  [0.20, 5.6, 4.5, 3.7, 3.2, 2.8, 2.5, 2.2, 0.050, 0.025, 0.021],
  [0.22, 5.1, 4.1, 3.4, 2.9, 2.6, 2.3, 2.1, 0.051, 0.025, 0.021],
  [0.24, 4.7, 3.8, 3.2, 2.7, 2.4, 2.1, 1.9, 0.051, 0.025, 0.021],
  [0.259, 4.4, 3.6, 3.0, 2.5, 2.2, 2.0, 1.8, 0.051, 0.026, 0.021],
  [0.28, 4.1, 3.3, 2.8, 2.4, 2.1, 1.8, 1.7, 0.052, 0.026, 0.022],
  [0.30, 3.9, 3.1, 2.6, 2.2, 1.9, 1.7, 1.6, 0.052, 0.026, 0.022],
  [0.32, 3.7, 3.0, 2.5, 2.1, 1.8, 1.6, 1.5, 0.053, 0.026, 0.022],
  [0.34, 3.5, 2.8, 2.3, 2.0, 1.8, 1.6, 1.4, 0.053, 0.027, 0.022],
  [0.36, 3.3, 2.7, 2.2, 1.9, 1.7, 1.5, 1.3, 0.054, 0.027, 0.022],
  [0.38, 3.2, 2.6, 2.1, 1.8, 1.6, 1.4, 1.3, 0.054, 0.027, 0.023],
  [0.40, 3.1, 2.5, 2.0, 1.8, 1.5, 1.4, 1.2, 0.055, 0.028, 0.023],
  [0.42, 2.9, 2.4, 2.0, 1.7, 1.5, 1.3, 1.2, 0.055, 0.028, 0.023],
  [0.44, 2.8, 2.3, 1.9, 1.6, 1.4, 1.3, 1.1, 0.056, 0.028, 0.023],
  [0.46, 2.7, 2.2, 1.8, 1.6, 1.4, 1.2, 1.1, 0.056, 0.028, 0.023],
  [0.48, 2.7, 2.1, 1.8, 1.5, 1.3, 1.2, 1.1, 0.057, 0.028, 0.024],
  [0.50, 2.6, 2.1, 1.7, 1.5, 1.3, 1.1, 1.0, 0.058, 0.029, 0.024],
  [0.52, 2.5, 2.0, 1.7, 1.4, 1.2, 1.1, 1.0, 0.058, 0.029, 0.024],
  [0.54, 2.4, 2.0, 1.6, 1.4, 1.2, 1.1, 1.0, 0.059, 0.029, 0.024],
  [0.56, 2.4, 1.9, 1.6, 1.4, 1.2, 1.1, 1.0, 0.059, 0.030, 0.025],
  [0.585, 2.3, 1.8, 1.5, 1.3, 1.2, 1.0, 0.9, 0.060, 0.030, 0.025],
  [0.60, 2.3, 1.8, 1.5, 1.3, 1.1, 1.0, 0.9, 0.061, 0.030, null],
  [0.628, 2.2, 1.8, 1.5, 1.3, 1.1, 1.0, 0.9, 0.062, 0.031, null],
  [0.64, 2.2, 1.7, 1.4, 1.2, 1.1, 1.0, 0.9, 0.062, null, null],
  [0.66, 2.1, 1.7, 1.4, 1.2, 1.1, 0.9, 0.8, 0.063, null, null],
  [0.68, 2.1, 1.7, 1.4, 1.2, 1.1, 0.9, 0.8, 0.063, null, null],
  [0.70, 2.0, 1.6, 1.4, 1.2, 1.0, 0.9, 0.8, 0.064, null, null],
  [0.72, 2.0, 1.6, 1.3, 1.2, 1.0, 0.9, 0.8, 0.065, null, null],
  [0.74, 2.0, 1.6, 1.3, 1.1, 1.0, 0.9, 0.8, 0.065, null, null],
  [0.76, 2.0, 1.6, 1.3, 1.1, 1.0, 0.9, 0.8, 0.066, null, null],
  [0.772, 1.9, 1.5, 1.3, 1.1, 1.0, 0.9, 0.8, 0.067, null, null],
];

// -----------------------------
// Utilitário opcional: achar índice da linha K mais próxima por Kc
// -----------------------------
export const findClosestIdxByKc = (kc: number): number => {
  let closest = 0;
  let minDiff = Math.abs(TABELA_K[0][K_COL_KC] - kc);
  for (let i = 1; i < TABELA_K.length; i++) {
    const diff = Math.abs(TABELA_K[i][K_COL_KC] - kc);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
};
