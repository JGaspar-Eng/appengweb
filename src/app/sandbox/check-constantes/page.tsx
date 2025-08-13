"use client";

import React, { useMemo } from "react";
import * as CONST from "@/components/constantes";
import { validarConstantes } from "@/lib/schemas";

export default function CheckConstantesPage() {
  const result = useMemo(() => {
    try {
      // Como o arquivo exporta nomeados, montamos um objeto com os símbolos esperados
      const pacote = {
        TRELICAS: (CONST as any).TRELICAS,
        CONCRETOS: (CONST as any).CONCRETOS,
        ACOS: (CONST as any).ACOS,
        TABELA_K: (CONST as any).TABELA_K,
      };
      validarConstantes(pacote as any);
      return { ok: true, msg: "Constantes válidas." };
    } catch (e: any) {
      return { ok: false, msg: e?.message ?? String(e) };
    }
  }, []);

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-3">Verificação das Constantes</h1>
      {result.ok ? (
        <div className="rounded border border-green-300 bg-green-50 text-green-800 p-4">
          ✅ {result.msg}
        </div>
      ) : (
        <div className="rounded border border-red-300 bg-red-50 text-red-800 p-4">
          ❌ Inconsistência: {result.msg}
        </div>
      )}
      <p className="text-sm text-gray-600 mt-4">
        Caminho: <code>/sandbox/check-constantes</code>. Não altera nenhuma página de produção.
      </p>
    </main>
  );
}
