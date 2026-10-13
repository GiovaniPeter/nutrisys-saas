import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warm' | 'elevated' | 'highlighted';
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', noPadding = false, className = '', ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      default: 'bg-white border border-sand-200 shadow-subtle',
      warm: 'bg-sand-50/60 border border-sand-200/80',
      elevated: 'bg-white border border-sand-200/60 shadow-card hover:shadow-float transition-shadow duration-200',
      highlighted: 'bg-white border-2 border-sage-700/60 shadow-card ring-1 ring-sage-100',
    };

    const padding = noPadding ? '' : 'p-5 sm:p-6';

    return (
      <div
        ref={ref}
        className={`rounded-2xl transition-all duration-150 ${variantStyles[variant]} ${padding} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`flex flex-col gap-1 pb-4 border-b border-sand-100 ${className}`}>{children}</div>;

export const CardTitle = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3 className={`text-base sm:text-lg font-semibold text-ink-900 tracking-tight font-display ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={`text-xs sm:text-sm text-ink-500 leading-relaxed ${className}`}>{children}</p>;

export const CardContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`pt-4 ${className}`}>{children}</div>;

export const CardFooter = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`mt-5 pt-4 border-t border-sand-100 flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);
