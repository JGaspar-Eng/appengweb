"use client";

import React, { useState } from "react";
import SlabSketch from "@/components/SlabSketch";

const FEATURE_ON = process.env.NEXT_PUBLIC_FEATURE_ARRANJO === "on";

export default function ArranjoSandboxPage() {
  const [bw, setBw] = useState(9);      // cm
  const [h, setH] = useState(12);       // cm
  const [d, setD] = useState(10.5);     // cm
  const [cover, setCover] = useState(2.0); // cm
  const [diamMm, setDiamMm] = useState(8); // mm
  const [qty, setQty] = useState(4);       // barras
  const [spacingCm, setSpacingCm] = useState<number | undefined>(undefined);
  const [showDimensions, setShowDimensions] = useState(true);

  if (!FEATURE_ON) {
    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold mb-2">Sandbox do Arranjo (SVG)</h1>
        <p className="text-sm mb-4">
          A flag <code>NEXT_PUBLIC_FEATURE_ARRANJO</code> está <strong>off</strong>. Para visualizar o desenho:
        </p>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Abra o arquivo <code>.env.local</code> na raiz do projeto.</li>
          <li>Adicione a linha: <code>NEXT_PUBLIC_FEATURE_ARRANJO=on</code></li>
          <li>Reinicie o servidor: <code>npm run dev</code></li>
          <li>Acesse <code>/sandbox/arranjo</code> novamente.</li>
        </ol>
      </main>
    );
  }

  const arrangement = { diamMm, qty, spacingCm };

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-2">Sandbox do Arranjo (SVG)</h1>
      <p className="text-sm text-gray-600 mb-4">
        Página isolada para validar o desenho do arranjo dentro da nervura. Alterar os parâmetros abaixo atualiza o SVG em tempo real.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controles */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">bw (cm)</label>
            <input
              type="number"
              value={bw}
              onChange={(e) => setBw(parseFloat(e.target.value) || 0)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">h (cm)</label>
            <input
              type="number"
              value={h}
              onChange={(e) => setH(parseFloat(e.target.value) || 0)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">d (cm)</label>
            <input
              type="number"
              value={d}
              onChange={(e) => setD(parseFloat(e.target.value) || 0)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Cobrimento (cm)</label>
            <input
              type="number"
              value={cover}
              onChange={(e) => setCover(parseFloat(e.target.value) || 0)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Diâmetro (mm)</label>
            <input
              type="number"
              value={diamMm}
              onChange={(e) => setDiamMm(parseFloat(e.target.value) || 0)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Quantidade de barras</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Espaçamento (cm) [opcional]</label>
            <input
              type="number"
              value={spacingCm ?? ""}
              onChange={(e) =>
                setSpacingCm(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
            />
            <label>Mostrar dimensões</label>
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center items-center border rounded-xl p-4 shadow-sm bg-white">
          <SlabSketch
            bw={bw}
            h={h}
            d={d}
            cover={cover}
            showDimensions={showDimensions}
            arrangement={arrangement}
          />
        </div>
      </div>
    </main>
  );
}
