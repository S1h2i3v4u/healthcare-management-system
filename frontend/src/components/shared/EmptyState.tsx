//import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarHeart } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  subtext?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({ message, subtext, icon: Icon = CalendarHeart, action }: EmptyStateProps) {
  return (
    <div className="text-center py-14 px-6 bg-gradient-to-b from-sage-50/60 to-transparent rounded-xl2 border border-dashed border-line">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-soft mb-4">
        <Icon className="w-5 h-5 text-teal-500" strokeWidth={1.75} />
      </div>
      <p className="text-ink font-medium">{message}</p>
      {subtext && <p className="text-sm text-ink-400 mt-1 max-w-xs mx-auto">{subtext}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}