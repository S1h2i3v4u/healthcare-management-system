
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { History, Stethoscope, MapPin, Pill, ChevronRight } from 'lucide-react';
import { getMyMedicalHistory } from '@/api/patientApi';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';

// §21's timeline — a vertical line connecting cards is the classic
// "medical history timeline" visual pattern; kept restrained (a thin
// teal line + small dots) rather than an elaborate illustrated timeline,
// matching the brief's "minimal, not clinical" direction.
export default function MedicalHistoryPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['medical-history'],
    queryFn: getMyMedicalHistory,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Medical History</h1>
        <p className="text-ink-400 mt-1">A complete timeline of your consultations, most recent first.</p>
      </div>

      {!history || history.length === 0 ? (
        <EmptyState
          icon={History}
          message="Your medical history will appear here"
          subtext="Once you complete your first consultation, it'll show up here as a permanent record."
        />
      ) : (
        <div className="relative pl-8">
          {/* Timeline spine */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-line" />

          <div className="space-y-5">
            {history.map((entry) => (
              <div key={entry.appointmentId} className="relative">
                <div className="absolute -left-8 top-5 w-[22px] h-[22px] rounded-full bg-teal-50 border-2 border-teal-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                </div>

                <Link to={`/patient/appointments/${entry.appointmentId}/consultation`}>
                  <Card hoverable className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-ink-400">
                          {format(parseISO(entry.appointmentDate), 'MMMM yyyy')}
                        </p>
                        <p className="font-medium text-ink mt-0.5">Dr. {entry.doctorName}</p>
                        <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                          <Stethoscope className="w-3.5 h-3.5" /> {entry.specialization}
                          <span className="mx-1">·</span>
                          <MapPin className="w-3.5 h-3.5" /> {entry.hospitalName}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-400 mt-1" />
                    </div>

                    {(entry.diagnosisSummary || entry.prescriptionSummary) && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-line">
                        {entry.diagnosisSummary && (
                          <span className="text-xs bg-sage-50 text-sage-500 px-2.5 py-1 rounded-full font-medium">
                            {entry.diagnosisSummary}
                          </span>
                        )}
                        {entry.prescriptionSummary && (
                          <span className="text-xs bg-lavender-50 text-lavender-400 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                            <Pill className="w-3 h-3" /> {entry.prescriptionSummary}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}