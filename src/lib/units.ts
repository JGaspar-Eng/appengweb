// Conversões e helpers simples de unidades (evita erros de cm ↔ m ↔ kN)

export const CM_PER_M = 100;
export const KN_PER_N = 1e-3;

export function cmToM(cm: number): number { return cm / CM_PER_M; }
export function mToCm(m: number): number { return m * CM_PER_M; }

// Massa específica/gravidade não inclusas de propósito (mantemos simples e explícito em cada caso)
export function kNperm2_to_kNperm(qPrime_kN_m2: number, faixa_m: number): number {
  // q (kN/m) = q' (kN/m²) * largura da faixa (m)
  return qPrime_kN_m2 * faixa_m;
}
