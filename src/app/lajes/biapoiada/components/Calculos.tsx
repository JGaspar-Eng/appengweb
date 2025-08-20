import { TRELICAS } from '@/components/constantes';
import { calculaPP, calcQLinha, calcEsforcos } from '@/lib/biapoiada';
import React, { useMemo } from 'react';
import { ResultsTable } from './ResultsTable';

type Props = {
  trelicaKey: string;
  Lx: number;
  Ly: number;
  qBase: number;
  usarPP: boolean;
};

export function Calculos({ trelicaKey, Lx, Ly, qBase, usarPP }: Props) {
  const tre = TRELICAS[trelicaKey];
  const { bf_m, PP_kN_m2 } = useMemo(() => calculaPP(tre), [tre]);
  const qTotal = usarPP ? qBase + PP_kN_m2 : qBase;
  const qLinha = calcQLinha(qTotal, bf_m);
  const L = Math.min(Lx, Ly);
  const { Vk, Mk_kNm, Md_kNcm } = calcEsforcos(L, qLinha);

  return <ResultsTable L={L} Vk={Vk} Mk={Mk_kNm} Md={Md_kNcm} As={qLinha} />;
}
