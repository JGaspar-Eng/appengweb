import { describe, it, expect } from 'vitest';
import { L_ocupado_cm, larguraUtilDentro, sminFromPhi, descArranjo, calcEsforcos, calcQLinha, calculaPP, TreExt } from '@/lib/biapoiada';

describe('biapoiada utilities', () => {
  it('computes occupied length', () => {
    expect(L_ocupado_cm(4, 1.2, 2)).toBeCloseTo(10.8);
  });

  it('computes inner useful width', () => {
    const tre: TreExt = { bw: 12, bf: 0, h: 0, hf: 0, d: 0 };
    expect(larguraUtilDentro(tre, 2, 0.5)).toBeCloseTo(7);
  });

  it('describes arrangement', () => {
    expect(descArranjo(3, 12)).toBe('3Ø12');
  });

  it('computes minimum spacing from bar diameter', () => {
    expect(sminFromPhi(1)).toBeCloseTo(2.28, 2);
  });

  it('calculates line load and efforts', () => {
    const tre: TreExt = { bw: 12, bf: 50, h: 16, hf: 5, d: 14 };
    const { bf_m, PP_kN_m2 } = calculaPP(tre);
    const qTotal = 5 + PP_kN_m2;
    const qLinha = calcQLinha(qTotal, bf_m);
    const { Vk, Mk_kNm, Md_kNcm } = calcEsforcos(3, qLinha);
    expect(qLinha).toBeGreaterThan(0);
    expect(Vk).toBeGreaterThan(0);
    expect(Mk_kNm).toBeGreaterThan(0);
    expect(Md_kNcm).toBeGreaterThan(0);
  });
});
