import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...rest }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">{label}</label>
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-ink placeholder:text-ink-400/60
            transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400
            ${error ? 'border-danger-500/40' : 'border-line'} ${className}`}
          {...rest}
        />
        {error && <p className="mt-1.5 text-sm text-danger-700">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';