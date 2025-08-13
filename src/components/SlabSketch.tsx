// src/components/SlabSketch.tsx
import React from "react";

type Props = {
  Lx: number; // m
  Ly: number; // m
  menor?: "Lx" | "Ly" | null;
  width?: number;  // px do canvas, altura é ajustada pela proporção
};

export default function SlabSketch({ Lx, Ly, menor = null, width = 280 }: Props) {
  const lx = Number.isFinite(Lx) && Lx > 0 ? Lx : 1;
  const ly = Number.isFinite(Ly) && Ly > 0 ? Ly : 1;
  const max = Math.max(lx, ly);
  const w = width;
  const h = width * (ly / max) / (lx / max);

  const pad = 10;
  const rx = 12;

  return (
    <svg width={w} height={h + 36} viewBox={`0 0 ${w} ${h + 36}`} aria-label="geometria da laje">
      <g transform={`translate(${pad}, ${pad})`}>
        <rect
          x={0}
          y={0}
          width={w - 2 * pad}
          height={h - 2 * pad}
          rx={rx}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        />
        {/* cota horizontal (Lx) */}
        <line x1={0} y1={h - 2 * pad + 8} x2={w - 2 * pad} y2={h - 2 * pad + 8} stroke="currentColor" />
        <text x={(w - 2 * pad) / 2} y={h - 2 * pad + 24} fontSize="12" textAnchor="middle">
          Lx = {Number.isFinite(Lx) ? Lx.toFixed(2) : "–"} m {menor === "Lx" ? "(menor)" : ""}
        </text>
        {/* cota vertical (Ly) */}
        <line x1={w - 2 * pad + 8} y1={0} x2={w - 2 * pad + 8} y2={h - 2 * pad} stroke="currentColor" />
        <text
          x={w - 2 * pad + 14}
          y={(h - 2 * pad) / 2}
          fontSize="12"
          writingMode="tb"
          glyphOrientationVertical="auto"
        >
          Ly = {Number.isFinite(Ly) ? Ly.toFixed(2) : "–"} m {menor === "Ly" ? "(menor)" : ""}
        </text>
      </g>
    </svg>
  );
}
