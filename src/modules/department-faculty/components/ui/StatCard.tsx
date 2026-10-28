import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  tone?: 'blue' | 'navy' | 'green' | 'amber' | 'red';
  onClick?: () => void;
}

const toneStyles = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  navy: 'bg-slate-100 text-navy-900 border-slate-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  tone = 'blue',
  onClick,
}) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start justify-between gap-3 ${
        onClick
          ? 'hover:border-blue-300 hover:shadow transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30'
          : ''
      }`}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-navy-900 mt-1.5 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1 leading-snug">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-lg border shrink-0 ${toneStyles[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </Wrapper>
  );
};

