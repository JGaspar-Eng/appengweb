// Algoritmos utilitários para sugerir arranjos de barras
// - trabalha em cm e mm conforme indicado
// - pensando em laje treliçada: verifica cabimento na nervura (largura útil bw - 2*cover)

export type Sugestao = {
  diamMm: number;
  qty: number;
  As_cm2: number;
  sobra_cm2: number;       // quanto passa da As alvo
  cabe: boolean;           // cabe na largura útil com espaçamento mínimo?
  larguraNecessaria_cm: number;
  motivoNaoCabe?: string;
};

export function areaBarra_cm2(diamMm: number): number {
  const d_cm = diamMm / 10; // mm -> cm
  return (Math.PI * d_cm * d_cm) / 4;
}

/**
 * Gera sugestões homogêneas (todas as barras do mesmo diâmetro).
 * - AsAlvo_cm2: área de aço requerida
 * - diametrosPossiveis_mm: catálogo (ex.: [5,6.3,8,10,12.5])
 * - bw_cm: largura da nervura
 * - cover_cm: cobrimento (cada lado)
 * - espacMin_cm: espaçamento mínimo entre faces (eixos – diâmetros aproximados)
 * - maxBarras: teto de barras para busca (padrão 12)
 */
export function sugerirArmadurasHomogeneas(
  AsAlvo_cm2: number,
  diametrosPossiveis_mm: number[],
  bw_cm: number,
  cover_cm: number,
  espacMin_cm: number = 2.0,
  maxBarras: number = 12
): Sugestao[] {
  const inner_cm = Math.max(0, bw_cm - 2 * cover_cm);
  const out: Sugestao[] = [];

  for (const diam of diametrosPossiveis_mm) {
    const aBar = areaBarra_cm2(diam);
    for (let qty = 1; qty <= maxBarras; qty++) {
      const As = aBar * qty;
      const sobra = Math.max(0, As - AsAlvo_cm2);

      // largura necessária aproximada: soma dos diâmetros + espaçamentos entre eixos
      const d_cm = diam / 10;
      const larguraNecessaria = qty * d_cm + (qty - 1) * espacMin_cm;

      const cabe = larguraNecessaria <= inner_cm;
      out.push({
        diamMm: diam,
        qty,
        As_cm2: round4(As),
        sobra_cm2: round4(sobra),
        cabe,
        larguraNecessaria_cm: round4(larguraNecessaria),
        motivoNaoCabe: cabe ? undefined : `Necessita ${round4(larguraNecessaria)} cm > ${round4(inner_cm)} cm úteis`,
      });
    }
  }

  // Ordena por: 1) cabe, 2) menor sobra, 3) menos barras, 4) menor diâmetro
  out.sort((a, b) => {
    if (a.cabe !== b.cabe) return a.cabe ? -1 : 1;
    if (a.sobra_cm2 !== b.sobra_cm2) return a.sobra_cm2 - b.sobra_cm2;
    if (a.qty !== b.qty) return a.qty - b.qty;
    return a.diamMm - b.diamMm;
  });

  return out;
}

function round4(x: number) {
  return Math.round(x * 1e4) / 1e4;
}
