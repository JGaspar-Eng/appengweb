// constantes.ts
// -------------------------------------------------
// Fonte única de dados do sistema
// -------------------------------------------------

import {
  CONCRETOS,
  ACOS,
  GAMMA_C,
  GAMMA_S,
  type Concreto,
  type Aco,
} from "@/data/materiais";
import {
  TRELICAS,
  C_SUP_PADRAO_CM,
  C_INF_PADRAO_CM,
  type Trelica,
} from "@/data/trelicas";
import {
  TABELA_K,
  K_COL_KC,
  K_COL_KS,
  K_COL_BX,
  type LinhaTabelaK,
} from "@/data/tabelaK";
import {
  DIAMETROS_PADRAO,
  BITOLAS,
  AREA_BY_DIAM,
  TABELA_ACO,
} from "@/data/aco";
import { gerarTabelaAco, gerarBitolas } from "@/lib/aco";

export {
  CONCRETOS,
  ACOS,
  GAMMA_C,
  GAMMA_S,
  TRELICAS,
  C_SUP_PADRAO_CM,
  C_INF_PADRAO_CM,
  TABELA_K,
  K_COL_KC,
  K_COL_KS,
  K_COL_BX,
  DIAMETROS_PADRAO,
  BITOLAS,
  AREA_BY_DIAM,
  TABELA_ACO,
  gerarTabelaAco,
  gerarBitolas,
};
export type { Concreto, Aco, Trelica, LinhaTabelaK };

// -----------------------------
// Helpers para gerar tabelas
// -----------------------------
// (funções de geração de dados movidas para src/lib/aco.ts)

// -----------------------------
// Tabela K helper
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
