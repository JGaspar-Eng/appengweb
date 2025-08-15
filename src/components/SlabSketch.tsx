import React from "react";

interface SlabSketchProps {
  lx: number; // largura (horizontal)
  ly: number; // altura (vertical)
}

export default function SlabSketch({ lx, ly }: SlabSketchProps) {
  const escala = 50; // px por metro
  const widthPx = lx * escala;
  const heightPx = ly * escala;

  return (
    <div className="border border-gray-500 inline-block bg-gray-100 p-2 my-4">
      <svg
        width={widthPx}
        height={heightPx}
        style={{ border: "2px solid black", background: "white" }}
      >
        {/* Retângulo representando a laje */}
        <rect
          x={0}
          y={0}
          width={widthPx}
          height={heightPx}
          fill="#e0e0e0"
          stroke="black"
          strokeWidth={2}
        />
        {/* Texto das dimensões */}
        <text
          x={widthPx / 2}
          y={-5}
          textAnchor="middle"
          fontSize="14"
          fill="black"
        >
          {lx} m
        </text>
        <text
          x={-5}
          y={heightPx / 2}
          textAnchor="end"
          fontSize="14"
          fill="black"
          transform={`rotate(-90, -5, ${heightPx / 2})`}
        >
          {ly} m
        </text>
      </svg>
    </div>
  );
}
