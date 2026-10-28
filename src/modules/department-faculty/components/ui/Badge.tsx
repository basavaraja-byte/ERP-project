import React from 'react';

export type BadgeVariant =
  | 'navy'
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'slate'
  | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  navy: 'bg-navy-900 text-white border-navy-900',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  navy: 'bg-blue-300',
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  amber: 'bg-amber-500',
  red: 'bg-red-600',
  slate: 'bg-slate-500',
  purple: 'bg-indigo-600',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  className = '',
  dot = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]}`} />}
      {children}
    </span>
  );
};

export function getComplaintStatusBadgeVariant(status: string): BadgeVariant {
  if (status === 'Resolved') return 'green';
  if (status === 'In Review') return 'amber';
  return 'red';
}

export function getPriorityBadgeVariant(priority: string): BadgeVariant {
  if (priority === 'High' || priority === 'Urgent') return 'red';
  if (priority === 'Medium' || priority === 'Important') return 'amber';
  return 'slate';
}

export function getEnrollmentBadgeVariant(status: string): BadgeVariant {
  if (status === 'Active') return 'green';
  if (status === 'Probation') return 'amber';
  if (status === 'Medical Leave') return 'blue';
  return 'red';
}

