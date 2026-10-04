import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import {
  CalendarPlus,
  CalendarDays,
  History,
  FileText,
  ClipboardList,
  ArrowRight,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { getMyAppointments } from '@/api/appointmentApi';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader } from '@/components/shared/Loader';
import { Avatar } from '@/components/shared/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PatientDashboard() {
  const { user } = useAuth();

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['appointments', 'my'],
    queryFn: getMyAppointments,
  });

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-8 text-center text-danger-700">
        Couldn't load your appointments.
      </div>
    );
  }

  const upcoming = (appointments ?? [])
    .filter(
      (a) =>
        (a.status === 'BOOKED' || a.status === 'CONFIRMED') &&
        isFuture(parseISO(a.appointmentDate))
    )
    .sort((a, b) =>
      a.appointmentDate.localeCompare(b.appointmentDate)
    );

  const todaysAppointments = upcoming.filter((a) =>
    isToday(parseISO(a.appointmentDate))
  );

  const nextAppointment = upcoming[0];

  const previousAppointments = (appointments ?? []).filter(
    (a) => a.status === 'COMPLETED'
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10 relative">

      {/* Gradient mesh background — same visual language as Landing/Auth,
          kept subtle since this is a page someone looks at daily, not a
          one-time marketing impression. */}
      <div className="absolute -left-20 top-0 w-72 h-72 bg-teal-400/[0.06] rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute right-0 top-40 w-64 h-64 bg-peach-400/[0.06] rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Welcome */}
      <div
        className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-600 px-5 sm:px-8 py-8 sm:py-10 text-white shadow-lift animate-fade-up"
        style={{ animationFillMode: 'both' }}
      >
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10 animate-float-slow" />
        <div className="absolute right-16 bottom-[-3rem] w-32 h-32 rounded-full bg-peach-400/20 animate-float" />
        <div className="absolute right-40 top-6 w-16 h-16 rounded-full bg-lavender-400/20 animate-float-slow" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-100 bg-white/10 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3 h-3" /> Good to see you
          </span>

          <h1 className="font-display text-2xl sm:text-3xl mt-1">
            {user?.fullName}
          </h1>

          <p className="text-teal-50/90 mt-2 max-w-md text-sm">
            Here's a calm overview of your care — appointments, records, and
            prescriptions, all in one place.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up"
        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
      >
        <StatCard
          icon={CalendarDays}
          label="Upcoming Appointment"
          value={
            nextAppointment
              ? format(
                  parseISO(nextAppointment.appointmentDate),
                  'MMM d'
                )
              : '—'
          }
          detail={
            nextAppointment
              ? `Dr. ${nextAppointment.doctorName} · ${nextAppointment.appointmentTime}`
              : 'None scheduled'
          }
          tint="teal"
        />

        <StatCard
          icon={ClipboardList}
          label="Today"
          value={String(todaysAppointments.length)}
          detail={
            todaysAppointments.length === 1
              ? 'appointment'
              : 'appointments'
          }
          tint="sage"
        />

        <StatCard
          icon={History}
          label="Past Visits"
          value={String(previousAppointments.length)}
          detail="completed consultations"
          tint="lavender"
        />
      </div>

      {/* Quick actions */}
      <div
        className="overflow-x-auto pb-1 animate-fade-up"
        style={{ animationDelay: '150ms', animationFillMode: 'both' }}
      >
        <div className="flex items-center gap-1 bg-cream-200/70 p-1 rounded-full w-max">
          <QuickTab
            to="/patient/find-doctors"
            icon={CalendarPlus}
            label="Book Appointment"
            primary
          />

          <QuickTab
            to="/patient/appointments"
            icon={CalendarDays}
            label="Appointments"
          />

          <QuickTab
            to="/patient/medical-history"
            icon={History}
            label="History"
          />

          <QuickTab
            to="/patient/prescriptions"
            icon={FileText}
            label="Prescriptions"
          />
        </div>
      </div>

      {/* Upcoming list */}
      <div
        className="animate-fade-up"
        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
      >
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="font-display text-xl text-ink">
            Upcoming Appointments
          </h2>

          {upcoming.length > 0 && (
            <Link
              to="/patient/appointments"
              className="text-sm text-teal-500 font-medium hover:text-teal-600 flex items-center gap-1 flex-shrink-0"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            message="No upcoming appointments yet"
            subtext="When you book a visit with a doctor, it'll show up here with all the details you need."
            action={
              <Link to="/patient/find-doctors">
                <Button>Find a Doctor</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3">
            {upcoming.slice(0, 5).map((appt) => (
              <Link
                key={appt.id}
                to={`/patient/appointments/${appt.id}`}
              >
                <Card
                  hoverable
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  {/* Doctor */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* NOTE: appt.profilePhotoUrl doesn't currently exist
                        on AppointmentResponse (backend) — only
                        DoctorResponse has it. This won't error (Avatar
                        falls back to initials when photoUrl is
                        undefined), but it also means no real photo will
                        ever show here until that field is added to the
                        backend DTO. Flagged as a known open gap, not
                        fixed in this pass. */}
                    <Avatar
                      photoUrl={appt.profilePhotoUrl}
                      name={appt.doctorName}
                      size="lg"
                    />

                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">
                        Dr. {appt.doctorName}
                      </p>

                      <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {appt.hospitalName}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Appointment details */}
                  <div className="sm:text-right sm:flex-shrink-0">
                    <p className="text-sm font-medium text-ink">
                      {format(
                        parseISO(appt.appointmentDate),
                        'MMM d, yyyy'
                      )}
                    </p>

                    <p className="text-sm text-ink-400 mb-1.5">
                      {appt.appointmentTime}
                    </p>

                    <StatusBadge status={appt.status} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  tint: 'teal' | 'sage' | 'lavender';
}) {
  const tintClasses = {
    teal: { bg: 'bg-teal-50', glow: 'bg-teal-400/30', text: 'text-teal-500' },
    sage: { bg: 'bg-sage-50', glow: 'bg-sage-400/30', text: 'text-sage-500' },
    lavender: { bg: 'bg-lavender-50', glow: 'bg-lavender-400/30', text: 'text-lavender-400' },
  }[tint];

  return (
    <Card hoverable className="p-5">
      <div className="relative w-9 h-9 mb-3">
        <div className={`absolute inset-0 rounded-full blur-md ${tintClasses.glow}`} />
        <div className={`relative w-9 h-9 rounded-full flex items-center justify-center ${tintClasses.bg} ${tintClasses.text}`}>
          {/* Fixed: w-4.5/h-4.5 aren't valid Tailwind classes — using an
              arbitrary value instead so this actually renders at the
              intended size regardless of your Tailwind config. */}
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </div>
      </div>

      <p className="text-sm text-ink-400">{label}</p>

      <p className="font-display text-2xl text-ink mt-0.5">
        {value}
      </p>

      <p className="text-xs text-ink-400 mt-0.5">
        {detail}
      </p>
    </Card>
  );
}

function QuickTab({
  to,
  icon: Icon,
  label,
  primary = false,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
        ${
          primary
            ? 'bg-teal-500 text-white shadow-soft hover:bg-teal-600 hover:shadow-lift'
            : 'text-ink-600 hover:bg-white'
        }`}
    >
      <Icon className="w-4 h-4" strokeWidth={1.75} />
      {label}
    </Link>
  );
}