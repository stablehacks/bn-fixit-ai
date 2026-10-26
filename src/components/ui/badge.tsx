import React from 'react';
import { cn } from '@/lib/utils';
import { UrgencyLevel, WorkOrderStatus } from '@/lib/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'emergency';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    emergency: 'bg-red-600 text-white font-bold border-red-700 shadow-sm animate-pulse',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel; className?: string }> = ({ urgency, className }) => {
  const map: Record<UrgencyLevel, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'emergency' }> = {
    low: { label: 'Low', variant: 'default' },
    normal: { label: 'Normal', variant: 'info' as any },
    high: { label: 'High Priority', variant: 'warning' },
    emergency: { label: 'CRITICAL EMERGENCY', variant: 'emergency' },
  };

  const config = map[urgency] || { label: urgency, variant: 'default' };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export const WorkOrderStatusBadge: React.FC<{ status: WorkOrderStatus; className?: string }> = ({ status, className }) => {
  const map: Record<WorkOrderStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
    'New': { variant: 'neutral' },
    'Needs Information': { variant: 'warning' },
    'Awaiting Approval': { variant: 'warning' },
    'Approved': { variant: 'info' },
    'Scheduled': { variant: 'info' },
    'In Progress': { variant: 'info' },
    'Completed': { variant: 'success' },
    'Cancelled': { variant: 'danger' },
  };

  const config = map[status] || { variant: 'default' };

  return (
    <Badge variant={config.variant} className={className}>
      {status}
    </Badge>
  );
};
