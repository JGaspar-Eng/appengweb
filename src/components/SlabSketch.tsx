"use client";

import React, { useMemo } from "react";

/**
 * Componente de desenho técnico do arranjo de barras dentro da nervura.
 * IMPORTANTE: Este componente é NO-OP por padrão.
 * Ele só renderiza quando a flag NEXT_PUBLIC_FEATURE_ARRANJO=on estiver definida.
 *
 * Objetivo: manter a versão estável intacta (sem SVG do arranjo).
 * Quando ativado por flag, renderiza um SVG leve e independente,
 * sem acoplar lógica de cálculo ou layout da biapoiada.
 */

type BarArrangement = {
  /** Diâmetro da barra em milímetros (ex.: 6, 8, 10, 12) */
  diamMm: number;
  /** Quantidade de barras na nervura */
  qty: number;
  /** Espaçamento (cm) opcional entre eixos; se não informado, distribui automaticamente */
  spacingCm?: number;
};

export interface SlabSketchProps {
  /** Largura da nervura (cm) */
  bw?: number;
  /** Altura total da laje (cm) — usado apenas para composição visual geral */
  h?: number;
  /** Altura útil (cm) — referência para posicionar a linha de tração/armadura */
  d?: number;
  /** Cobrimento (cm) — distância até a face da armadura de tração */
  cover?: number;
  /** Desenhar cotas/medidas? (apenas quando a flag estiver ativa) */
  showDimensions?: boolean;
  /** Arranjo de barras sugerido/selecionado */
  arrangement?: BarArrangement;
  /** Classe adicional para o wrapper */
  className?: string;
}

/**
 * Regra de ativação: só desenha algo quando a flag estiver ligada.
 * Em Next.js, NEXT_PUBLIC_* é substituída em build-time e pode ser lida no client.
 */
const FEATURE_ON = process.env.NEXT_PUBLIC_FEATURE_ARRANJO === "on";

const DEFAULTS = {
  bw: 9, // cm
  h: 12, // cm
  d: 10.5, // cm
  cover: 2.0, // cm (ambiente I/II — apenas referência visual)
};

const PX_PER_CM = 4; // escala base (4 px por cm) — simples e suficiente para rascunho técnico

const SlabSketch: React.FC<SlabSketchProps> = ({
  bw = DEFAULTS.bw,
  h = DEFAULTS.h,
  d = DEFAULTS.d,
  cover = DEFAULTS.cover,
  showDimensions = false,
  arrangement,
  className,
}) => {
  // NO-OP quando a flag está OFF — não altera a versão estável
  if (!FEATURE_ON) return null;

  const { svgW, svgH, ribX, ribY, ribW, ribH } = useMemo(() => {
    // Margem externa para labels/cotas
    const margin = 24;
    const ribWpx = Math.max(1, bw * PX_PER_CM);
    const ribHpx = Math.max(1, h * PX_PER_CM);

    return {
      svgW: ribWpx + margin * 2,
      svgH: ribHpx + margin * 2,
      ribX: margin,
      ribY: margin,
      ribW: ribWpx,
      ribH: ribHpx,
    };
  }, [bw, h]);

  // Conversores cm→px
  const cm2px = (cm: number) => cm * PX_PER_CM;

  // Posição vertical aproximada da linha de tração (perto da base)
  const tensionY = useMemo(() => {
    const marginTop = ribY;
    const baseY = marginTop + ribH; // base da nervura
    const y = baseY - cm2px(cover); // cobrimento até a face inferior
    return y;
  }, [ribY, ribH, cover]);

  // Geração das barras (quando arrangement existir)
  const bars = useMemo(() => {
    if (!arrangement || arrangement.qty <= 0) return [];

    // Área útil para espaçamento entre faces internas (descontando cobrimento em ambos os lados)
    const innerWidthCm = Math.max(0, bw - 2 * cover);
    const innerWidthPx = cm2px(innerWidthCm);

    // Diâmetro em px (aprox.), convertendo mm→cm→px
    const barDiaPx = cm2px(arrangement.diamMm / 10); // mm/10 = cm

    const positionsX: number[] = [];
    const startX = ribX + cm2px(cover);

    if (arrangement.spacingCm && arrangement.qty > 1) {
      // Se spacing foi informado, usa espaçamento fixo entre eixos; centra o conjunto
      const spacingPx = cm2px(arrangement.spacingCm);
      const neededWidth = spacingPx * (arrangement.qty - 1);
      const offset = (innerWidthPx - neededWidth) / 2;
      for (let i = 0; i < arrangement.qty; i++) {
        positionsX.push(startX + offset + i * spacingPx);
      }
    } else {
      // Distribuição uniforme automática nos eixos
      if (arrangement.qty === 1) {
        positionsX.push(startX + innerWidthPx / 2);
      } else {
        const step = innerWidthPx / (arrangement.qty - 1);
        for (let i = 0; i < arrangement.qty; i++) {
          positionsX.push(startX + i * step);
        }
      }
    }

    // Todas as barras no mesmo y (linha de tração)
    const y = tensionY - barDiaPx / 2; // centraliza o círculo sobre a linha de tração

    return positionsX.map((x) => ({ x, y, r: barDiaPx / 2 }));
  }, [arrangement, bw, cover, tensionY, ribX]);

  return (
    <div className={className}>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        role="img"
        aria-label="Arranjo de armaduras na nervura"
      >
        {/* Fundo branco para consistência visual */}
        <rect x={0} y={0} width={svgW} height={svgH} fill="white" />

        {/* Nervura (retângulo) */}
        <rect
          x={ribX}
          y={ribY}
          width={ribW}
          height={ribH}
          fill="#f3f4f6"
          stroke="#111827"
          strokeWidth={1}
        />

        {/* Linha de tração (aproximação visual na base) */}
        <line
          x1={ribX}
          y1={tensionY}
          x2={ribX + ribW}
          y2={tensionY}
          stroke="#6b7280"
          strokeDasharray="4 2"
          strokeWidth={1}
        />

        {/* Barras (se houver arrangement) */}
        {bars.map((b, idx) => (
          <circle key={idx} cx={b.x} cy={b.y} r={b.r} stroke="#111827" fill="#d1d5db" />
        ))}

        {/* Cotas simples (opcionais) */}
        {showDimensions && (
          <>
            {/* Cota da largura bw */}
            <line
              x1={ribX}
              y1={ribY + ribH + 12}
              x2={ribX + ribW}
              y2={ribY + ribH + 12}
              stroke="#111827"
              strokeWidth={1}
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            <text
              x={ribX + ribW / 2}
              y={ribY + ribH + 10}
              fontSize="12"
              textAnchor="middle"
              fill="#111827"
            >
              bw = {bw} cm
            </text>

            {/* Cota da altura h */}
            <line
              x1={ribX + ribW + 12}
              y1={ribY}
              x2={ribX + ribW + 12}
              y2={ribY + ribH}
              stroke="#111827"
              strokeWidth={1}
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            <text
              x={ribX + ribW + 14}
              y={ribY + ribH / 2}
              fontSize="12"
              writingMode="tb"
              fill="#111827"
            >
              h = {h} cm
            </text>
          </>
        )}

        {/* Marcadores de seta para cotas */}
        <defs>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#111827" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default SlabSketch;
