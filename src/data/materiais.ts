/**
 * Catálogos de materiais e fatores de segurança.
 */

/** Concreto disponível. */
export type Concreto = {
  fck: number; // MPa
  fcd: number; // kN/cm²
};

/** Aço disponível. */
export type Aco = {
  fyk: number; // MPa
  fyd: number; // kN/cm²
};

// Fatores de segurança
export const GAMMA_C = 1.4;
export const GAMMA_S = 1.15;

/**
 * Lista de concretos suportados.
 */
export const CONCRETOS: Record<string, Concreto> = {
  C20: { fck: 20, fcd: parseFloat(((20 / GAMMA_C) / 10).toFixed(3)) },
  C25: { fck: 25, fcd: parseFloat(((25 / GAMMA_C) / 10).toFixed(3)) },
  C30: { fck: 30, fcd: parseFloat(((30 / GAMMA_C) / 10).toFixed(3)) },
  C35: { fck: 35, fcd: parseFloat(((35 / GAMMA_C) / 10).toFixed(3)) },
  C40: { fck: 40, fcd: parseFloat(((40 / GAMMA_C) / 10).toFixed(3)) },
  C45: { fck: 45, fcd: parseFloat(((45 / GAMMA_C) / 10).toFixed(3)) },
  C50: { fck: 50, fcd: parseFloat(((50 / GAMMA_C) / 10).toFixed(3)) },
};

/**
 * Lista de classes de aço suportadas.
 */
export const ACOS: Record<string, Aco> = {
  CA25: { fyk: 250, fyd: parseFloat(((250 / GAMMA_S) / 10).toFixed(3)) },
  CA50: { fyk: 500, fyd: parseFloat(((500 / GAMMA_S) / 10).toFixed(3)) },
  CA60: { fyk: 600, fyd: parseFloat(((600 / GAMMA_S) / 10).toFixed(3)) },
};

