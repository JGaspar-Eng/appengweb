/**
 * Funções utilitárias relacionadas a aço e bitolas.
 */

/**
 * Gera tabela de área de aço acumulada para combinações de diâmetro e quantidade.
 * @param diametros Lista de diâmetros das barras em milímetros.
 * @param maxBarras Quantidade máxima de barras a considerar.
 * @returns Objeto com arrays de áreas acumuladas por diâmetro.
 */
export const gerarTabelaAco = (diametros: number[], maxBarras = 10) => {
  const tabela: Record<number, number[]> = {};
  diametros.forEach((diam) => {
    const area = parseFloat(((Math.PI * (diam / 10) ** 2) / 4).toFixed(3)); // cm²
    tabela[diam] = Array.from({ length: maxBarras }, (_, i) =>
      parseFloat(((i + 1) * area).toFixed(3))
    );
  });
  return tabela;
};

/**
 * Calcula área de cada bitola.
 * @param diametros Lista de diâmetros em milímetros.
 * @returns Lista de objetos com diâmetro e área correspondente.
 */
export const gerarBitolas = (diametros: number[]) => {
  return diametros.map((diam) => ({
    diam,
    area: parseFloat(((Math.PI * (diam / 10) ** 2) / 4).toFixed(3)), // cm²
  }));
};

