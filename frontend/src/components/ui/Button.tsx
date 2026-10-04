import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-teal-500 text-white hover:bg-teal-600 shadow-soft hover:shadow-lift',
  secondary:
    'bg-sage-50 text-teal-600 border border-sage-100 hover:bg-sage-100',
  ghost: 'text-ink-600 hover:bg-cream-200',
  danger: 'bg-danger-50 text-danger-700 border border-danger-500/20 hover:bg-danger-500 hover:text-white',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 font-medium text-sm py-2.5 px-5 rounded-full
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98] ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}