/**
 * Dados das treliças pré-fabricadas usadas no sistema.
 */

export type Trelica = {
  bw: number;
  bf: number;
  h: number;   // altura total da laje (cm)
  hf: number;  // espessura da capa (cm)
  d: number;   // altura útil (cm)
  h_trelica_cm?: number; // altura da treliça (cm)
  arm?: {
    top_mm: number;   // diâmetro do banzo superior (mm)
    diag_mm: number;  // diâmetro das diagonais (mm)
    base_mm: number;  // diâmetro do banzo inferior (mm)
  };
  displayName?: string;
};

// Cobrimentos padrão (cm)
export const C_SUP_PADRAO_CM = 2.5;
export const C_INF_PADRAO_CM = 1.5;

/**
 * Catálogo de treliças.
 */
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

// Gera displayName automaticamente quando ausente
Object.entries(TRELICAS).forEach(([key, tr]) => {
  if (tr && !tr.displayName) {
    const hVal = Number.isFinite(tr.h) ? tr.h : (tr.h_trelica_cm ?? 0);
    const hfVal = Number.isFinite(tr.hf) ? tr.hf : C_SUP_PADRAO_CM;
    const lt = Math.round(hVal + hfVal);
    tr.displayName = `${key} — LT${lt} (${hVal} + ${hfVal})`;
  }
});

