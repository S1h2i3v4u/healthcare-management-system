import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';
import { CalendarDays, MapPin } from 'lucide-react';
import { getMyAppointments } from '@/api/appointmentApi';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader } from '@/components/shared/Loader';
import type { Appointment } from '@/types';

type FilterTab = 'upcoming' | 'past' | 'cancelled' | 'all';

// Patient-side equivalent of DoctorAppointmentsPage — same tab-filter
// pattern, deliberately kept visually and structurally consistent with
// its doctor-side counterpart, since it's fundamentally the same kind of
// page (one person's appointment list, filtered by time/status) just
// viewed from the other side of the relationship.
export default function PatientAppointmentsPage() {
  const [tab, setTab] = useState<FilterTab>('upcoming');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'my'],
    queryFn: getMyAppointments,
  });

  if (isLoading) return <Loader />;

  const all = appointments ?? [];
  const filtered = filterByTab(all, tab);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">My Appointments</h1>
        <p className="text-ink-400 mt-1">All your scheduled and past visits.</p>
      </div>

      <div className="flex items-center gap-1 bg-cream-200/70 p-1 rounded-full w-fit">
        {(['upcoming', 'past', 'cancelled', 'all'] as FilterTab[]).map((t) => (
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
            <Link key={appt.id} to={`/patient/appointments/${appt.id}`}>
              <Card hoverable className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 font-display text-sm flex-shrink-0">
                    {appt.doctorName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-ink">Dr. {appt.doctorName}</p>
                    <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {appt.hospitalName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink">{format(parseISO(appt.appointmentDate), 'MMM d, yyyy')}</p>
                  <p className="text-sm text-ink-400 mb-1.5">{appt.appointmentTime}</p>
                  <StatusBadge status={appt.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function filterByTab(appointments: Appointment[], tab: FilterTab): Appointment[] {
  switch (tab) {
    case 'upcoming':
      return appointments.filter(
        (a) => (a.status === 'BOOKED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
          && (isFuture(parseISO(a.appointmentDate)) || isToday(parseISO(a.appointmentDate))),
      );
    case 'past':
      return appointments.filter(
        (a) => a.status === 'COMPLETED' || (isPast(parseISO(a.appointmentDate)) && !isToday(parseISO(a.appointmentDate)) && a.status !== 'CANCELLED'),
      );
    case 'cancelled':
      return appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW');
    case 'all':
    default:
      return appointments;
  }
}