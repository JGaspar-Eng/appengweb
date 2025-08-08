import React from "react";

interface ArmaduraSugeridaProps {
  resultados: {
    t: any;
    c?: any;
    a?: any;
    fcd: number;
    fyd: number;
    md: number[];
    kc: number[];
  } | null;
  dadosTabelaK: { ks?: number; bx?: number }[];
  hf?: number;
  d?: number;
  fcd?: number | string;
  fyd?: number | string;
}

const BITOLAS = [
  { diam: 6.3, area: 0.312 },
  { diam: 8.0, area: 0.503 },
  { diam: 10.0, area: 0.785 },
  { diam: 12.5, area: 1.227 },
  { diam: 16.0, area: 2.010 }
];

function sugerirBitolas(As: number): { diam: number, n: number, areaTotal: number }[] {
  const sugestoes: { diam: number, n: number, areaTotal: number }[] = [];
  for (const bitola of BITOLAS) {
    let n = Math.ceil(As / bitola.area);
    let areaTotal = n * bitola.area;
    if (n > 0 && areaTotal >= As) {
      sugestoes.push({ diam: bitola.diam, n, areaTotal: +areaTotal.toFixed(3) });
    }
  }
  return sugestoes.sort((a, b) => (a.areaTotal - b.areaTotal) || (a.n - b.n)).slice(0, 3);
}

const ArmaduraSugerida: React.FC<ArmaduraSugeridaProps> = ({
  resultados,
  dadosTabelaK,
  hf,
  d,
  fcd,
  fyd
}) => {
  if (!resultados) return null;

  function calcularAs(idx: number): number {
    const ks = dadosTabelaK[idx]?.ks ?? 0;
    const md = resultados.md[idx];
    const d_ = resultados.t.d ?? d ?? 0;
    const fyd_ = resultados.fyd ?? fyd ?? 0;
    if (!ks || !md || !d_ || !fyd_) return 0;
    return +(ks * md / (d_ * fyd_)).toFixed(3);
  }
  function calcularX(idx: number): number {
    const bx = dadosTabelaK[idx]?.bx ?? 0;
    const d_ = resultados.t.d ?? d ?? 0;
    return +(bx * d_).toFixed(2);
  }
  function ehSecaoT(idx: number): boolean {
    const x = calcularX(idx);
    const hf_ = resultados.t.hf ?? hf ?? 0;
    return x > 1.25 * hf_;
  }

  return (
    <div className="mt-6">
      <h3 className="font-bold text-cyan-800 dark:text-cyan-200 text-base mb-2">
        Armadura Sugerida e Visualização
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {[0, 1, 2].map((idx) => {
          const As = calcularAs(idx);
          const x = calcularX(idx);
          const secaoT = ehSecaoT(idx);
          const sugestoes = sugerirBitolas(As);

          return (
            <div key={idx} className="bg-white dark:bg-neutral-900 rounded-xl shadow p-3">
              <div className="mb-1 text-xs font-semibold text-cyan-800 dark:text-cyan-200">
                <b>Momento {idx + 1}</b>
              </div>
              <div className="text-xs">
                <b>Área de aço (As):</b> <span className="font-mono">{As} cm²/m</span><br />
                <b>Linha neutra (x):</b> <span className="font-mono">{x} cm</span><br />
                <b>Seção T:</b> <span className={secaoT ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                  {secaoT ? "Verdadeiro" : "Falso"}
                </span>
              </div>
              <div className="mt-2 mb-2">
                <b>Sugestão de armadura:</b>
                <ul className="list-disc ml-5 text-xs">
                  {sugestoes.map((s, i) => (
                    <li key={i}>
                      {s.n} barras ⌀{s.diam} mm &rarr; <b>{s.areaTotal} cm²</b>
                      {s.areaTotal - As < 0.05 ? " (ótima)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-end gap-1 h-10 mt-2">
                {sugestoes.length > 0 &&
                  Array.from({ length: sugestoes[0].n }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full bg-cyan-600"
                      style={{
                        width: Math.max(12, sugestoes[0].diam),
                        height: Math.max(12, sugestoes[0].diam)
                      }}
                      title={`Barra ⌀${sugestoes[0].diam} mm`}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArmaduraSugerida;
