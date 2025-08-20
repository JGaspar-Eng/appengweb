import { gerarBitolas, gerarTabelaAco } from "@/lib/aco";

/** Diâmetros padrão de barras (mm). */
export const DIAMETROS_PADRAO = [5, 6.3, 8, 10, 12.5, 16, 20, 25, 32] as const;

/** Lista de bitolas com área correspondente (cm²). */
export const BITOLAS = gerarBitolas([...DIAMETROS_PADRAO]);

/** Mapa auxiliar de área por diâmetro (cm²). */
export const AREA_BY_DIAM: Record<number, number> = Object.fromEntries(
  BITOLAS.map((b) => [b.diam, b.area])
) as Record<number, number>;

/** Tabela de áreas acumuladas de aço. */
export const TABELA_ACO = gerarTabelaAco([...DIAMETROS_PADRAO]);

