import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

// The one card primitive every surface in the app uses from here on —
// warm white, soft shadow, very light border, generous radius. This single
// definition is what makes "cohesive design system" actually true instead
// of aspirational: every card, everywhere, comes from this file.
export function Card({ hoverable = false, className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl2 border border-line shadow-card ${
        hoverable ? 'transition-all duration-200 hover:shadow-lift hover:-translate-y-0.5' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}