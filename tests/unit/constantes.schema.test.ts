import * as CONST from "@/components/constantes";
import { validarConstantes } from "@/lib/schemas";

describe("Validação da fonte única de dados (constantes.ts)", () => {
  test("estrutura e regras básicas OK", () => {
    const pacote = {
      TRELICAS: (CONST as any).TRELICAS,
      CONCRETOS: (CONST as any).CONCRETOS,
      ACOS: (CONST as any).ACOS,
      TABELA_K: (CONST as any).TABELA_K,
    };
    expect(() => validarConstantes(pacote as any)).not.toThrow();
  });
});
