//import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-danger-50 border border-danger-500/15 px-4 py-3 text-sm text-danger-700">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}