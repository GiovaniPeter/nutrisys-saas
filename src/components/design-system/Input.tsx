import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
  unit?: string; // ex: 'g', 'kcal', 'R$', 'cm'
  tabular?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      prefixNode,
      suffixNode,
      unit,
      tabular = false,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(error);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-ink-700 tracking-wide uppercase"
          >
            {label}
          </label>
        )}

        <div
          className={`relative flex items-center w-full rounded-xl border bg-white transition-all duration-150 ${
            hasError
              ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
              : 'border-sand-300 focus-within:border-sage-600 focus-within:ring-2 focus-within:ring-sage-100 hover:border-sand-400'
          } ${disabled ? 'bg-sand-50 opacity-60 cursor-not-allowed' : ''}`}
        >
          {prefixNode && (
            <div className="pl-3.5 pr-1 flex items-center text-ink-400 select-none pointer-events-none">
              {prefixNode}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError && inputId ? `${inputId}-error` : undefined}
            className={`w-full h-10 px-3.5 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none disabled:cursor-not-allowed ${
              tabular ? 'font-mono tabular-nums' : ''
            } ${prefixNode ? 'pl-1.5' : ''} ${suffixNode || unit ? 'pr-1.5' : ''} ${className}`}
            {...props}
          />

          {unit && (
            <span className="pr-3 pl-1 text-xs font-medium text-ink-500 bg-sand-100/70 py-1 px-2 mr-1.5 rounded-md select-none">
              {unit}
            </span>
          )}

          {suffixNode && (
            <div className="pr-3 pl-1 flex items-center text-ink-400 select-none">
              {suffixNode}
            </div>
          )}
        </div>

        {hasError && (
          <p id={inputId ? `${inputId}-error` : undefined} className="text-xs text-red-600 flex items-center gap-1">
            <span>•</span> {error}
          </p>
        )}

        {!hasError && hint && (
          <p className="text-xs text-ink-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
