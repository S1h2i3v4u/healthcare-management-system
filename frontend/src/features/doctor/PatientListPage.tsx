//import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Users, Calendar } from 'lucide-react';
import { getMyPatients } from '@/api/doctorPatientApi';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function PatientListPage() {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor', 'my-patients'],
    queryFn: getMyPatients,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">My Patients</h1>
        <p className="text-ink-400 mt-1">Everyone you've had an appointment with.</p>
      </div>

      {!patients || patients.length === 0 ? (
        <EmptyState icon={Users} message="No patients yet" subtext="Patients you've seen will appear here." />
      ) : (
        <div className="grid gap-3">
          {patients.map((p) => (
            <Link key={p.patientProfileId} to={`/doctor/patients/${p.patientProfileId}/history`}>
              <Card hoverable className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-sage-50 flex items-center justify-center text-sage-500 font-display text-sm">
                    {p.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{p.fullName}</p>
                    <p className="text-sm text-ink-400">
                      {p.age ? `${p.age} yrs` : ''}{p.age && p.gender ? ' · ' : ''}{p.gender ?? ''}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-ink-400">
                  {p.lastAppointmentDate && (
                    <p>Last visit: {format(parseISO(p.lastAppointmentDate), 'MMM d, yyyy')}</p>
                  )}
                  {p.nextAppointmentDate && (
                    <p className="text-teal-500 font-medium flex items-center gap-1 justify-end mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> Next: {format(parseISO(p.nextAppointmentDate), 'MMM d')}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}