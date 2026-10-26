import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs font-medium',
      md: 'px-4 py-2 text-sm font-medium',
      lg: 'px-5 py-2.5 text-base font-medium',
    };

    const variantStyles = {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500',
      secondary: 'bg-navy-900 hover:bg-navy-800 text-white shadow-xs focus:ring-navy-800',
      outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs focus:ring-slate-400',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
