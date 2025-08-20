// src/app/lajes/biapoiada/page.tsx
"use client";

import { useState } from 'react';
import InternalHeader from '@/app/components/InternalHeader';
import Footer from '@/app/components/Footer';
import { BiapoiadaForm } from './components/BiapoiadaForm';
import { Calculos } from './components/Calculos';

export default function LajeBiapoiadaPage() {
  const [trelicaKey, setTrelicaKey] = useState('TR12645');
  const [concretoKey, setConcretoKey] = useState('C30');
  const [acoKey, setAcoKey] = useState('CA50');
  const [Lx, setLx] = useState(5.3);
  const [Ly, setLy] = useState(3.85);
  const [qBase, setQBase] = useState(5.0);
  const [usarPP, setUsarPP] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <InternalHeader title="Laje biapoiada" />
      <main className="flex-1 container mx-auto p-4 space-y-4">
        <BiapoiadaForm
          trelicaKey={trelicaKey}
          setTrelicaKey={setTrelicaKey}
          concretoKey={concretoKey}
          setConcretoKey={setConcretoKey}
          acoKey={acoKey}
          setAcoKey={setAcoKey}
          Lx={Lx}
          Ly={Ly}
          setLx={setLx}
          setLy={setLy}
          qBase={qBase}
          setQBase={setQBase}
          usarPP={usarPP}
          setUsarPP={setUsarPP}
        />
        <Calculos
          trelicaKey={trelicaKey}
          Lx={Lx}
          Ly={Ly}
          qBase={qBase}
          usarPP={usarPP}
        />
      </main>
      <Footer />
    </div>
  );
}
