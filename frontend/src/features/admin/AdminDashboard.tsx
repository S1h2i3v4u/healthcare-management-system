import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Stethoscope, Building2, CalendarDays, Clock3, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDashboard } from '@/api/adminApi';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/shared/Loader';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: getDashboard });

  if (isLoading) return <Loader />;
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Admin Overview</h1>
        <p className="text-ink-400 mt-1">Welcome back, {user?.fullName}.</p>
      </div>

      {data.pendingDoctorVerifications > 0 && (
        <Link to="/admin/doctors?status=PENDING">
          <Card hoverable className="p-5 flex items-center justify-between bg-warning-50 border-warning-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-warning-700">
                <Clock3 className="w-4.5 h-4.5" />
              </div>
              <p className="text-sm font-medium text-warning-700">
                {data.pendingDoctorVerifications} doctor{data.pendingDoctorVerifications !== 1 ? 's' : ''} awaiting verification
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-warning-700" />
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Patients" value={data.totalPatients} tint="teal" />
        <StatCard icon={Stethoscope} label="Verified Doctors" value={data.verifiedDoctors} tint="sage" />
        <StatCard icon={Building2} label="Hospitals" value={data.totalHospitals} tint="lavender" />
        <StatCard icon={CalendarDays} label="Today's Appointments" value={data.todaysAppointments} tint="peach" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SmallStat icon={CalendarDays} label="Total Appointments" value={data.totalAppointments} />
        <SmallStat icon={CheckCircle2} label="Completed" value={data.completedAppointments} accent="text-success-700" />
        <SmallStat icon={XCircle} label="Cancelled" value={data.cancelledAppointments} accent="text-danger-700" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/doctors" className="px-4 py-2.5 rounded-full bg-teal-500 text-white text-sm font-medium hover:bg-teal-600">
          Manage Doctors
        </Link>
        <Link to="/admin/hospitals" className="px-4 py-2.5 rounded-full bg-cream-200/70 text-ink-600 text-sm font-medium hover:bg-cream-200">
          Manage Hospitals
        </Link>
        <Link to="/admin/audit-logs" className="px-4 py-2.5 rounded-full bg-cream-200/70 text-ink-600 text-sm font-medium hover:bg-cream-200">
          Audit Logs
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: {
  icon: React.ElementType; label: string; value: number; tint: 'teal' | 'sage' | 'lavender' | 'peach';
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

function SmallStat({ icon: Icon, label, value, accent = 'text-ink' }: {
  icon: React.ElementType; label: string; value: number; accent?: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <Icon className={`w-4 h-4 ${accent}`} strokeWidth={1.75} />
      <div>
        <p className="text-xs text-ink-400">{label}</p>
        <p className={`font-medium ${accent}`}>{value}</p>
      </div>
    </Card>
  );
}