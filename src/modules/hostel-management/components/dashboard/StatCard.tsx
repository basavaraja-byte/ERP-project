import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtitle: string;
  linkTo: string;
  linkLabel?: string;
  colorScheme?: 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtitle,
  linkTo,
  linkLabel = 'View details',
  colorScheme = 'indigo',
}) => {
  const schemeClasses = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'text-indigo-700',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'text-blue-700',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'text-emerald-700',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'text-amber-700',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'text-rose-700',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      badge: 'text-slate-700',
    },
  }[colorScheme];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
          <div className={`p-2.5 rounded-xl border ${schemeClasses.iconBg} shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        </div>

        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={linkTo}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          {linkLabel}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
