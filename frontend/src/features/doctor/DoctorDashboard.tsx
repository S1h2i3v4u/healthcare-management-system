import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isToday, parseISO } from 'date-fns';
import { CalendarDays, Users, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyAppointmentsAsDoctor } from '@/api/appointmentApi';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader } from '@/components/shared/Loader';

export default function DoctorDashboard() {
  const { user } = useAuth();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'doctor', 'my'],
    queryFn: getMyAppointmentsAsDoctor,
  });

  if (isLoading) return <Loader />;

  const all = appointments ?? [];
  const todaysAppointments = all.filter(
    (a) => isToday(parseISO(a.appointmentDate)) && (a.status === 'BOOKED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'),
  );
  const upcoming = all.filter(
    (a) => !isToday(parseISO(a.appointmentDate)) && (a.status === 'BOOKED' || a.status === 'CONFIRMED'),
  );
  const completedCount = all.filter((a) => a.status === 'COMPLETED').length;
  const uniquePatients = new Set(all.map((a) => a.patientName)).size;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-teal-500 to-teal-600 px-8 py-9 text-white">
        <div className="absolute -right-10 -top-14 w-52 h-52 rounded-full bg-white/10" />
        <p className="text-teal-100 text-sm font-medium">Welcome back</p>
        <h1 className="font-display text-3xl mt-1">Dr. {user?.fullName}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Today" value={String(todaysAppointments.length)} tint="teal" />
        <StatCard icon={Clock} label="Upcoming" value={String(upcoming.length)} tint="sage" />
        <StatCard icon={CheckCircle2} label="Completed" value={String(completedCount)} tint="lavender" />
        <StatCard icon={Users} label="Patients Seen" value={String(uniquePatients)} tint="peach" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink">Today's Appointments</h2>
          <Link to="/doctor/appointments" className="text-sm text-teal-500 font-medium hover:text-teal-600 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todaysAppointments.length === 0 ? (
          <EmptyState icon={CalendarDays} message="No appointments today" subtext="Enjoy the quiet — new bookings will show up here." />
        ) : (
          <div className="grid gap-3">
            {todaysAppointments.map((appt) => (
              <Link key={appt.id} to={`/doctor/appointments/${appt.id}`}>
                <Card hoverable className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-sage-50 flex items-center justify-center text-sage-500 font-display text-sm">
                      {appt.patientName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{appt.patientName}</p>
                      <p className="text-sm text-ink-400">{appt.appointmentTime}</p>
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: {
  icon: React.ElementType; label: string; value: string; tint: 'teal' | 'sage' | 'lavender' | 'peach';
}) {
  const tintClasses = {
    teal: 'bg-teal-50 text-teal-500', sage: 'bg-sage-50 text-sage-500',
    lavender: 'bg-lavender-50 text-lavender-400', peach: 'bg-peach-50 text-peach-400',
  }[tint];
  return (
    <Card className="p-5">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tintClasses} mb-3`}>
        <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
      </div>
      <p className="text-sm text-ink-400">{label}</p>
      <p className="font-display text-2xl text-ink mt-0.5">{value}</p>
    </Card>
  );
}