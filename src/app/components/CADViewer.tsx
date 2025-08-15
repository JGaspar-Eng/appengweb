"use client";

import React, { useState, useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

interface Polyline {
  t: "polyline";
  points: Point[];
}

interface CADViewerProps {
  data: Polyline[];
}

export default function CADViewer({ data }: CADViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState<{ [key: number]: number }>({});
  const svgRef = useRef<SVGSVGElement>(null);

  // Função para converter os pontos em path
  const getPathFromPoints = (points: Point[]) => {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${-p.y}`).join(" ") + " Z";
  };

  // Clicar para selecionar o objeto
  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  // Rotacionar objeto selecionado
  const rotateSelected = (angle: number) => {
    if (selectedIndex === null) return;
    setRotation((prev) => ({
      ...prev,
      [selectedIndex]: (prev[selectedIndex] || 0) + angle,
    }));
  };

  // Captura tecla R e Shift+R para girar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex !== null) {
        if (e.key.toLowerCase() === "r" && !e.shiftKey) {
          rotateSelected(5); // gira 5° sentido horário
        } else if (e.key.toLowerCase() === "r" && e.shiftKey) {
          rotateSelected(-5); // gira 5° sentido anti-horário
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Botões de rotação */}
      {selectedIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            gap: "5px",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => rotateSelected(-5)}
            style={{
              padding: "5px 10px",
              background: "#ddd",
              border: "1px solid #aaa",
              cursor: "pointer",
            }}
          >
            ↺
          </button>
          <button
            onClick={() => rotateSelected(5)}
            style={{
              padding: "5px 10px",
              background: "#ddd",
              border: "1px solid #aaa",
              cursor: "pointer",
            }}
          >
            ↻
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 500 500"
        style={{
          background: "#f0f0f0",
          border: "1px solid #ccc",
        }}
      >
        <g transform="translate(50, 400) scale(1, -1)">
          {data.map((item, index) => (
            <path
              key={index}
              d={getPathFromPoints(item.points)}
              fill="none"
              stroke={selectedIndex === index ? "red" : "black"}
              strokeWidth={selectedIndex === index ? 2 : 1}
              transform={`rotate(${rotation[index] || 0}, ${item.points[0].x}, ${-item.points[0].y})`}
              onClick={() => handleSelect(index)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
