import React from 'react';

type Props = {
  L: number;
  Vk: number;
  Mk: number;
  Md: number;
  As: number;
};

export function ResultsTable({ L, Vk, Mk, Md, As }: Props) {
  const fmt = (n: number) => Number.isFinite(n) ? n.toFixed(2) : '–';
  return (
    <table className="border-collapse border text-sm">
      <tbody>
        <tr>
          <th className="border p-1">L (m)</th>
          <td className="border p-1">{fmt(L)}</td>
        </tr>
        <tr>
          <th className="border p-1">Vk (kN)</th>
          <td className="border p-1">{fmt(Vk)}</td>
        </tr>
        <tr>
          <th className="border p-1">Mk (kN·m)</th>
          <td className="border p-1">{fmt(Mk)}</td>
        </tr>
        <tr>
          <th className="border p-1">Md (kN·cm)</th>
          <td className="border p-1">{fmt(Md)}</td>
        </tr>
        <tr>
          <th className="border p-1">As (cm²)</th>
          <td className="border p-1">{fmt(As)}</td>
        </tr>
      </tbody>
    </table>
  );
}
