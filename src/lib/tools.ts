// src/lib/tools.ts

// ----------------------------
// Tipos auxiliares
// ----------------------------
export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ToolResult = {
  tool_call_id: string;
  role: "tool";
  name: string;
  content: string; // JSON string
};

// ----------------------------
// Especificações p/ OpenAI (Chat Completions)
// ----------------------------
export const toolSpecs = [
  {
    type: "function",
    function: {
      name: "sum",
      description: "Soma uma lista de números",
      parameters: {
        type: "object",
        properties: {
          numbers: { type: "array", items: { type: "number" } },
        },
        required: ["numbers"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_time",
      description: "Retorna o horário atual do servidor (ISO)",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "tabela_k_lookup",
      description:
        "Busca ks (pela coluna do FCK selecionado) e bx (βx, pela coluna do FYK selecionado) para um Kc informado. Aceita interpolação linear.",
      parameters: {
        type: "object",
        properties: {
          kc: { type: "number", description: "Coeficiente Kc calculado" },
          fck: {
            type: "string",
            enum: ["C20", "C25", "C30", "C35", "C40", "C45", "C50"],
            description: "Coluna de ks (ex.: 'C30')",
          },
          fyk: {
            type: "string",
            enum: ["CA25", "CA50", "CA60"],
            description: "Coluna de bx/βx (ex.: 'CA50')",
          },
          estrategia: {
            type: "string",
            enum: ["vizinho", "interpolar"],
            default: "vizinho",
            description: "Como resolver quando Kc está entre linhas",
          },
        },
        required: ["kc", "fck", "fyk"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "dimensionar_laje",
      description:
        "Dimensionamento básico: As = ks * Md / d - As_existente (unidades coerentes).",
      parameters: {
        type: "object",
        properties: {
          Md: { type: "number", description: "Momento de cálculo (kN·cm)" },
          d: { type: "number", description: "Altura útil (cm)" },
          ks: { type: "number", description: "Coeficiente da Tabela K (coluna FCK)" },
          As_existente: {
            type: "number",
            description: "Armadura existente a descontar (ex.: 0.4 cm²)",
          },
        },
        required: ["Md", "d", "ks"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sinapi_fetch",
      description:
        "Consulta preço de insumo no SINAPI por UF/mês (base local em JSON).",
      parameters: {
        type: "object",
        properties: {
          uf: { type: "string", description: "Ex.: 'PR'" },
          mes: { type: "string", description: "AAAA-MM, ex.: '2025-04'" },
          insumo: { type: "string", description: "Código ou descrição" },
        },
        required: ["uf", "mes", "insumo"],
      },
    },
  },
];

// ----------------------------
// Implementações locais
// ----------------------------
import { dimensionarLajeBasico } from "./engine";
import { TABELA_K_COMPLETA } from "@/components/constantes";

// Tipos para colunas
type FCK = "C20" | "C25" | "C30" | "C35" | "C40" | "C45" | "C50";
type FYK = "CA25" | "CA50" | "CA60";

// Busca por Kc (vizinho ou interpolado) retornando {ks, bx} — usando TABELA_K_COMPLETA
function lookupKsBxFromConstantes(
  kcTarget: number,
  fck: FCK,
  fyk: FYK,
  estrategia: "vizinho" | "interpolar" = "vizinho"
) {
  const rows = [...TABELA_K_COMPLETA].sort((a, b) => a.kc - b.kc);
  const getKs = (r: typeof TABELA_K_COMPLETA[number]) =>
    (typeof r.ks[fck] === "number" ? (r.ks[fck] as number) : null);
  const getBx = (r: typeof TABELA_K_COMPLETA[number]) =>
    (typeof r.bx[fyk] === "number" ? (r.bx[fyk] as number) : null);

  const kcMin = rows[0].kc;
  const kcMax = rows[rows.length - 1].kc;
  if (kcTarget < kcMin || kcTarget > kcMax) {
    return {
      ok: false as const,
      error: `kc fora do domínio da Tabela K (${kcMin}–${kcMax}). Valor informado: ${kcTarget}.`,
    };
  }

  const exata = rows.find((r) => r.kc === kcTarget);
  if (exata) {
    return {
      ok: true as const,
      modo: "exato" as const,
      entrada: { kc: kcTarget, fck, fyk },
      saida: { kc: exata.kc, ks: getKs(exata), bx: getBx(exata) },
      linha: exata,
    };
  }

  let lower = rows[0];
  let upper = rows[rows.length - 1];
  for (let i = 0; i < rows.length - 1; i++) {
    if (rows[i].kc <= kcTarget && kcTarget <= rows[i + 1].kc) {
      lower = rows[i];
      upper = rows[i + 1];
      break;
    }
  }

  if (estrategia === "interpolar" && upper.kc !== lower.kc) {
    const t = (kcTarget - lower.kc) / (upper.kc - lower.kc);
    const ler = (a: number | null, b: number | null) =>
      a != null && b != null
        ? a + t * (b - a)
        : Math.abs(kcTarget - lower.kc) <= Math.abs(upper.kc - kcTarget)
        ? a ?? b ?? null
        : b ?? a ?? null;

    const ks = ler(getKs(lower), getKs(upper));
    const bx = ler(getBx(lower), getBx(upper));

    return {
      ok: true as const,
      modo: "interpolar" as const,
      entrada: { kc: kcTarget, fck, fyk },
      saida: { kc: kcTarget, ks, bx },
      referencias: { lower, upper },
    };
  }

  let best = rows[0];
  for (const r of rows) {
    if (Math.abs(r.kc - kcTarget) < Math.abs(best.kc - kcTarget)) best = r;
  }
  return {
    ok: true as const,
    modo: "vizinho" as const,
    entrada: { kc: kcTarget, fck, fyk },
    saida: { kc: best.kc, ks: getKs(best), bx: getBx(best) },
    referencia: best,
  };
}

export async function runToolCall(call: ToolCall): Promise<ToolResult> {
  const { name, arguments: argsStr } = call.function;
  const args = argsStr ? (JSON.parse(argsStr) as any) : {};

  if (name === "sum") {
    const numbers: number[] = Array.isArray(args.numbers) ? args.numbers : [];
    const sum = numbers.reduce((a, b) => a + b, 0);
    return { tool_call_id: call.id, role: "tool", name, content: JSON.stringify({ sum }) };
  }

  if (name === "get_time") {
    return {
      tool_call_id: call.id,
      role: "tool",
      name,
      content: JSON.stringify({ iso: new Date().toISOString() }),
    };
  }

  if (name === "dimensionar_laje") {
    const { Md, d, ks, As_existente = 0 } = args;
    const { As_calc } = dimensionarLajeBasico(Md, d, ks, As_existente);
    return {
      tool_call_id: call.id,
      role: "tool",
      name,
      content: JSON.stringify({ As_calc }),
    };
  }

  if (name === "tabela_k_lookup") {
    const { kc, fck, fyk, estrategia = "vizinho" } = args as {
      kc: number;
      fck: FCK;
      fyk: FYK;
      estrategia?: "vizinho" | "interpolar";
    };

    const out = lookupKsBxFromConstantes(kc, fck, fyk, estrategia);
    return {
      tool_call_id: call.id,
      role: "tool",
      name,
      content: JSON.stringify(out),
    };
  }

  if (name === "sinapi_fetch") {
    const { uf, mes, insumo } = args;
    const base = await import("@/data/sinapi_prices.json");
    const price = (base as any)?.[uf]?.[mes]?.[insumo] ?? null;

    if (!price) {
      return {
        tool_call_id: call.id,
        role: "tool",
        name,
        content: JSON.stringify({
          ok: false,
          error:
            "Base SINAPI não encontrada. Adicione src/data/sinapi_prices.json no formato { UF: { 'AAAA-MM': { 'INSUMO': valor } } }",
        }),
      };
    }
    return {
      tool_call_id: call.id,
      role: "tool",
      name,
      content: JSON.stringify({ ok: true, uf, mes, insumo, price }),
    };
  }

  return {
    tool_call_id: call.id,
    role: "tool",
    name,
    content: JSON.stringify({ ok: false, error: `Tool '${name}' não implementada` }),
  };
}
