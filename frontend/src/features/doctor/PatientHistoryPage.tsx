//import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { History, Stethoscope, Pill } from 'lucide-react';
import { getPatientHistoryForDoctor } from '@/api/patientApi';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';

// Near-identical layout to the patient's own MedicalHistoryPage — same
// timeline visual, deliberately reused rather than redesigned, since it's
// the same kind of information just viewed by a different role. No
// clickable link into ConsultationRecordPage here, though: that page's
// route (/patient/appointments/:id/consultation) is under the PATIENT
// role guard, so a doctor navigating there would hit RoleRoute's redirect.
// A doctor-side consultation viewer is a separate page, not yet built —
// flagged rather than linked to something that would silently fail.
export default function PatientHistoryPage() {
  const { patientProfileId } = useParams<{ patientProfileId: string }>();
  const navigate = useNavigate();

  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['patient-history', patientProfileId],
    queryFn: () => getPatientHistoryForDoctor(Number(patientProfileId)),
  });

  if (isLoading) return <Loader />;
  if (isError) {
    return (
      <div className="p-8 text-center text-danger-700">
        You don't have access to this patient's history, or it doesn't exist.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-ink-400 hover:text-ink-600">
        ← Back
      </button>

      <div>
        <h1 className="font-display text-2xl text-ink">Patient Medical History</h1>
        <p className="text-ink-400 mt-1">Previous consultations with this patient, most recent first.</p>
      </div>

      {!history || history.length === 0 ? (
        <EmptyState icon={History} message="No previous consultations" subtext="This is this patient's first recorded visit." />
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <Card key={entry.appointmentId} className="p-5">
              <p className="text-xs text-ink-400">{format(parseISO(entry.appointmentDate), 'MMMM d, yyyy')}</p>
              <p className="font-medium text-ink mt-0.5">Dr. {entry.doctorName} · {entry.specialization}</p>

              {(entry.diagnosisSummary || entry.prescriptionSummary) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {entry.diagnosisSummary && (
                    <span className="text-xs bg-sage-50 text-sage-500 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" /> {entry.diagnosisSummary}
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
          ))}
        </div>
      )}
    </div>
  );
}