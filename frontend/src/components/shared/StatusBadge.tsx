//import React from 'react';
import type { AppointmentStatus } from '@/types';

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  BOOKED: 'bg-teal-50 text-teal-600',
  CONFIRMED: 'bg-lavender-50 text-lavender-400',
  IN_PROGRESS: 'bg-warning-50 text-warning-700',
  COMPLETED: 'bg-success-50 text-success-700',
  CANCELLED: 'bg-danger-50 text-danger-700',
  NO_SHOW: 'bg-cream-200 text-ink-400',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  BOOKED: 'Booked', CONFIRMED: 'Confirmed', IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed', CANCELLED: 'Cancelled', NO_SHOW: 'No Show',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </span>
  );
}