import { z } from "zod";

// ---- Esquemas ----
const TrelicaSchema = z.object({
  bw: z.number(),
  bf: z.number(),
  h: z.number(),
  hf: z.number(),
  d: z.number(),
});

export const TrelicasSchema = z.record(TrelicaSchema);
export const ConcretosSchema = z.record(z.number());
export const AcoesSchema = z.record(z.number());

// TABELA_K: matriz de números (cada linha inicia por Bx)
export const TabelaKSchema = z.array(z.array(z.number().finite()));

// Pacote completo que esperamos em "@/components/constantes"
export const ConstantesSchema = z.object({
  TRELICAS: TrelicasSchema,
  CONCRETOS: ConcretosSchema,
  ACOS: AcoesSchema,
  TABELA_K: TabelaKSchema,
});

// ---- Validação + Regras adicionais ----
export type ConstantesType = z.infer<typeof ConstantesSchema>;

export function validarConstantes(consts: ConstantesType) {
  // 1) Checagem de chaves mínimas
  ConstantesSchema.parse(consts);

  // 2) Regras extras: bw/h/d positivos; Bx não-negativo e não-decrescente
  for (const [nome, t] of Object.entries(consts.TRELICAS)) {
    if (!(t.bw > 0 && t.h > 0 && t.d > 0)) {
      throw new Error(`Treliça ${nome}: valores devem ser positivos (bw, h, d).`);
    }
  }

  let prevBx: number | undefined = undefined;
  for (const row of consts.TABELA_K) {
    if (row.length === 0) throw new Error("Linha vazia em TABELA_K.");
    const bx = row[0];
    if (bx < 0) throw new Error("Bx negativo em TABELA_K.");
    if (prevBx !== undefined && bx < prevBx) {
      throw new Error("Bx não é não-decrescente em TABELA_K.");
    }
    prevBx = bx;
  }

  return true;
}
