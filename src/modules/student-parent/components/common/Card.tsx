import React from 'react';
import { cn } from '../../utils/formatters';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverable = false
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden',
        hoverable && 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}> = ({ title, subtitle, action, className, icon }) => {
  return (
    <div className={cn('px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">{icon}</div>}
        <div>
          <h3 className="text-base font-semibold text-slate-900 leading-snug">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn('p-5', className)}>{children}</div>;
};

export const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  trend?: {
    label: string;
    positive?: boolean;
  };
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
  className?: string;
  onClick?: () => void;
}> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'blue',
  className,
  onClick
}) => {
  const schemeStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  };

  const scheme = schemeStyles[colorScheme];

  return (
    <Card hoverable={!!onClick} onClick={onClick} className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'font-medium px-1.5 py-0.5 rounded',
                  trend.positive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                )}
              >
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl border', scheme.bg, scheme.text, scheme.border)}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
