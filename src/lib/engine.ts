// src/lib/engine.ts

/**
 * Dimensionamento básico (genérico) — etapa mínima:
 *   As = ks * Md / d - As_existente
 * Garanta UNIDADES coerentes (ex.: kN·cm, cm²).
 */
export function dimensionarLajeBasico(
  Md: number,
  d: number,
  ks: number,
  As_existente: number = 0
): { As_calc: number } {
  if (d <= 0) throw new Error("Altura útil d deve ser > 0");
  const As = (ks * Md) / d - (As_existente || 0);
  return { As_calc: As };
}
