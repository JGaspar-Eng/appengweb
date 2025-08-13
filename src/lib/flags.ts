// Fonte única para flags de recurso.
// Regra: lê NEXT_PUBLIC_FEATURE_<NOME>=on|off e permite override por query (?ff_<nome>=on|off)

export type FeatureValue = "on" | "off";

function readEnv(name: string): FeatureValue | undefined {
  if (typeof process === "undefined") return undefined;
  const key = `NEXT_PUBLIC_FEATURE_${name.toUpperCase()}`;
  const val = (process.env as any)?.[key];
  return val === "on" || val === "off" ? val : undefined;
}

function readQuery(name: string): FeatureValue | undefined {
  if (typeof window === "undefined") return undefined;
  const param = new URLSearchParams(window.location.search).get(`ff_${name.toLowerCase()}`);
  return param === "on" || param === "off" ? param : undefined;
}

/** Retorna true se a feature estiver ON (env ou query), com query sobrescrevendo env. */
export function featureIsOn(name: string, fallback: FeatureValue = "off"): boolean {
  const envVal = readEnv(name);
  const queryVal = readQuery(name);
  const finalVal = (queryVal ?? envVal ?? fallback);
  return finalVal === "on";
}

/** Helper específico já usado no projeto (arranjo SVG) */
export function isArranjoOn(): boolean {
  return featureIsOn("ARRANJO", "off");
}
