import React from 'react';

export type ButtonVariant = 'primary' | 'terracotta' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles: accessible focus ring, micro-interaction transitions, touch target comfort
    const baseStyles =
      'inline-flex items-center justify-center font-medium select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

    // Variant mapping
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-sage-900 text-white hover:bg-sage-800 focus-visible:ring-sage-700 shadow-sm hover:shadow active:bg-sage-950',
      terracotta:
        'bg-terracotta-500 text-white hover:bg-terracotta-600 focus-visible:ring-terracotta-400 shadow-sm hover:shadow active:bg-terracotta-700',
      secondary:
        'bg-sand-100 text-ink-900 border border-sand-200 hover:bg-sand-200/80 hover:border-sand-300 focus-visible:ring-sand-400',
      outline:
        'bg-transparent text-ink-800 border border-sand-300 hover:bg-sand-50 hover:border-ink-400 focus-visible:ring-sage-600',
      ghost:
        'bg-transparent text-ink-700 hover:bg-sand-100 hover:text-ink-900 focus-visible:ring-sand-400',
      danger:
        'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 focus-visible:ring-red-400',
    };

    // Size mapping with minimum 44px mobile touch comfort for md/lg
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5 min-h-[32px]',
      md: 'h-10 px-4 text-sm rounded-xl gap-2 min-h-[40px] sm:min-h-[40px]',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5 min-h-[48px]',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
