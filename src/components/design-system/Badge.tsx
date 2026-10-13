import React from 'react';

export type BadgeVariant =
  | 'sage'
  | 'terracotta'
  | 'cho'
  | 'ptn'
  | 'lip'
  | 'fib'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  hasDot?: boolean;
}

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  hasDot = false,
  className = '',
  ...props
}: BadgeProps) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    sage: {
      container: 'bg-sage-100 text-sage-900 border-sage-200',
      dot: 'bg-sage-600',
    },
    terracotta: {
      container: 'bg-terracotta-100 text-terracotta-800 border-terracotta-200',
      dot: 'bg-terracotta-500',
    },
    cho: {
      container: 'bg-amber-100 text-amber-900 border-amber-200',
      dot: 'bg-amber-600',
    },
    ptn: {
      container: 'bg-rose-100 text-rose-900 border-rose-200',
      dot: 'bg-rose-600',
    },
    lip: {
      container: 'bg-teal-100 text-teal-900 border-teal-200',
      dot: 'bg-teal-600',
    },
    fib: {
      container: 'bg-purple-100 text-purple-900 border-purple-200',
      dot: 'bg-purple-600',
    },
    success: {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
    },
    warning: {
      container: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    error: {
      container: 'bg-red-50 text-red-800 border-red-200',
      dot: 'bg-red-500',
    },
    neutral: {
      container: 'bg-sand-100 text-ink-700 border-sand-200',
      dot: 'bg-ink-400',
    },
  };

  const sizeStyles = {
    sm: 'text-[11px] font-medium py-0.5 px-2 rounded-md gap-1',
    md: 'text-xs font-semibold py-1 px-2.5 rounded-lg gap-1.5',
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center border select-none transition-colors ${style.container} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {hasDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {children}
    </span>
  );
};
