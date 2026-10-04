import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Filter, MapPin } from 'lucide-react';
import { getAdminAppointments } from '@/api/adminApi';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
];

export default function AppointmentManagementPage() {
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'appointments', status, date],
    queryFn: () => getAdminAppointments({
      status: status || undefined,
      date: date || undefined,
      size: 50,
    }),
  });

  if (isLoading) return <Loader />;

  const appointments = data?.content ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Manage Appointments</h1>
        <p className="text-ink-400 mt-1">System-wide view of all appointments, filterable by status and date.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3 text-sm text-ink-600 font-medium">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </Card>

      {appointments.length === 0 ? (
        <EmptyState icon={CalendarDays} message="No appointments match these filters" subtext="Try adjusting the status or date." />
      ) : (
        <div className="grid gap-3">
          {appointments.map((appt: any) => (
            <Card key={appt.id} className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">{appt.patientName} → Dr. {appt.doctorName}</p>
                <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> {appt.hospitalName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-ink">{format(parseISO(appt.appointmentDate), 'MMM d, yyyy')}</p>
                <p className="text-sm text-ink-400 mb-1.5">{appt.appointmentTime}</p>
                <StatusBadge status={appt.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}