import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 
    | 'success' 
    | 'warning' 
    | 'danger' 
    | 'info' 
    | 'neutral' 
    | 'purple'
    | 'cyan';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/10',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-blue-500/10',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80 ring-purple-500/10',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200/80 ring-cyan-500/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${variantClasses} ${sizeClasses} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};
