import { TRELICAS, CONCRETOS, ACOS } from '@/components/constantes';
import React from 'react';

type Props = {
  trelicaKey: string;
  setTrelicaKey: (v: string) => void;
  concretoKey: string;
  setConcretoKey: (v: string) => void;
  acoKey: string;
  setAcoKey: (v: string) => void;
  Lx: number;
  Ly: number;
  setLx: (v: number) => void;
  setLy: (v: number) => void;
  qBase: number;
  setQBase: (v: number) => void;
  usarPP: boolean;
  setUsarPP: (v: boolean) => void;
};

export function BiapoiadaForm({
  trelicaKey,
  setTrelicaKey,
  concretoKey,
  setConcretoKey,
  acoKey,
  setAcoKey,
  Lx,
  Ly,
  setLx,
  setLy,
  qBase,
  setQBase,
  usarPP,
  setUsarPP,
}: Props) {
  return (
    <form className="space-y-2">
      <div>
        <label className="block text-sm">Treliça</label>
        <select
          className="border p-1"
          value={trelicaKey}
          onChange={(e) => setTrelicaKey(e.target.value)}
        >
          {Object.keys(TRELICAS).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm">Concreto</label>
        <select
          className="border p-1"
          value={concretoKey}
          onChange={(e) => setConcretoKey(e.target.value)}
        >
          {Object.keys(CONCRETOS).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm">Aço</label>
        <select
          className="border p-1"
          value={acoKey}
          onChange={(e) => setAcoKey(e.target.value)}
        >
          {Object.keys(ACOS).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm">Lx (m)</label>
        <input
          className="border p-1"
          type="number"
          value={Lx}
          onChange={(e) => setLx(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm">Ly (m)</label>
        <input
          className="border p-1"
          type="number"
          value={Ly}
          onChange={(e) => setLy(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm">q base (kN/m²)</label>
        <input
          className="border p-1"
          type="number"
          value={qBase}
          onChange={(e) => setQBase(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label className="inline-flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={usarPP}
            onChange={(e) => setUsarPP(e.target.checked)}
          />
          <span>Incluir peso próprio</span>
        </label>
      </div>
    </form>
  );
}
