import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...rest }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">{label}</label>
        <div className="relative">
          <select
            ref={ref}
            className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-ink
              transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400
              ${error ? 'border-danger-500/40' : 'border-line'} ${className}`}
            {...rest}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-ink-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-sm text-danger-700">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';