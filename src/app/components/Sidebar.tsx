'use client';
import {
  FolderKanban,
  Calculator,
  FileText,
  BarChart2,
  Settings,
} from 'lucide-react';

const navItems = [
  { icon: <FolderKanban />, label: 'Projetos' },
  { icon: <Calculator />, label: 'Calculadoras' },
  { icon: <BarChart2 />, label: 'Orçamentos' },
  { icon: <FileText />, label: 'Relatórios' },
  { icon: <Settings />, label: 'Configurações' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-slate-50 border-r min-h-screen py-8 px-4 gap-2">
      {navItems.map((item, idx) => (
        <button
          key={item.label}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 transition"
        >
          <span className="w-5 h-5">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </aside>
  );
}
