'use client';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
}

export default function DashboardCard({ title, description, icon, href }: DashboardCardProps) {
  const CardContent = (
    <div className="bg-white shadow rounded-xl p-6 flex flex-col items-start gap-2 hover:shadow-lg transition border hover:border-blue-500 cursor-pointer">
      <div className="text-blue-600">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
  if (href) {
    return <a href={href}>{CardContent}</a>;
  }
  return CardContent;
}
