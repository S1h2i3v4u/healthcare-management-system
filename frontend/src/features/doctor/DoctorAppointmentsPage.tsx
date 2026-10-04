import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';
import { CalendarDays, User } from 'lucide-react';
import { getMyAppointmentsAsDoctor } from '@/api/appointmentApi';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader } from '@/components/shared/Loader';
import type { Appointment } from '@/types';

type FilterTab = 'today' | 'upcoming' | 'past' | 'all';

// §14's full appointments list — filter tabs rather than a separate page
// per status, since the underlying data is small enough (one doctor's
// appointments) that client-side filtering is simpler than four separate
// API calls for what's fundamentally one dataset viewed different ways.
export default function DoctorAppointmentsPage() {
  const [tab, setTab] = useState<FilterTab>('today');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'doctor', 'my'],
    queryFn: getMyAppointmentsAsDoctor,
  });

  if (isLoading) return <Loader />;

  const all = appointments ?? [];
  const filtered = filterByTab(all, tab);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Appointments</h1>
        <p className="text-ink-400 mt-1">All your scheduled and past appointments.</p>
      </div>

      <div className="flex items-center gap-1 bg-cream-200/70 p-1 rounded-full w-fit">
        {(['today', 'upcoming', 'past', 'all'] as FilterTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors
              ${tab === t ? 'bg-white text-teal-600 shadow-soft' : 'text-ink-400 hover:text-ink-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} message={`No ${tab === 'all' ? '' : tab} appointments`} subtext="Nothing to show here right now." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((appt) => (
            <Link key={appt.id} to={`/doctor/appointments/${appt.id}`}>
              <Card hoverable className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-sage-50 flex items-center justify-center text-sage-500 flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{appt.patientName}</p>
                    <p className="text-sm text-ink-400">
                      {format(parseISO(appt.appointmentDate), 'MMM d, yyyy')} · {appt.appointmentTime}
                    </p>
                  </div>
                </div>
                <StatusBadge status={appt.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function filterByTab(appointments: Appointment[], tab: FilterTab): Appointment[] {
  const active = appointments.filter((a) => a.status === 'BOOKED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');

  switch (tab) {
    case 'today':
      return active.filter((a) => isToday(parseISO(a.appointmentDate)));
    case 'upcoming':
      return active.filter((a) => isFuture(parseISO(a.appointmentDate)) && !isToday(parseISO(a.appointmentDate)));
    case 'past':
      return appointments.filter((a) => isPast(parseISO(a.appointmentDate)) && !isToday(parseISO(a.appointmentDate)));
    case 'all':
    default:
      return appointments;
  }
}