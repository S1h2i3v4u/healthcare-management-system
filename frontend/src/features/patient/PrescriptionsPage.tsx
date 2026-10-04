import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { FileText, Download, Printer, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';
import { getMyPrescriptions, downloadPrescriptionPdf } from '@/api/prescriptionApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';

// §22's "My Prescriptions" — expandable cards rather than navigating to a
// separate detail page per prescription, since the full medicine detail
// is already included in the list response (unlike Medical History's
// deliberately thin summary), so a second page would just duplicate data
// already on screen.
export default function PrescriptionsPage() {
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', 'my'],
    queryFn: getMyPrescriptions,
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    try {
      await downloadPrescriptionPdf(id);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">My Prescriptions</h1>
        <p className="text-ink-400 mt-1">Every prescription written for you, from any doctor or visit.</p>
      </div>

      {!prescriptions || prescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          message="No prescriptions yet"
          subtext="Prescriptions from your completed consultations will appear here."
        />
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => {
            const isExpanded = expandedId === rx.prescriptionId;
            return (
              <Card key={rx.prescriptionId} className="overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rx.prescriptionId)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-100/60 transition-colors"
                >
                  <div>
                    <p className="text-xs text-ink-400">{format(parseISO(rx.prescriptionDate), 'MMM d, yyyy')}</p>
                    <p className="font-medium text-ink mt-0.5">Dr. {rx.doctorName}</p>
                    <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5" /> {rx.diagnosisName ?? rx.hospitalName}
                      <span className="mx-1">·</span>
                      {rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-line pt-4">
                    <div className="space-y-2.5 mb-4">
                      {rx.medicines.map((med, i) => (
                        <div key={i} className="flex items-start justify-between text-sm">
                          <div>
                            <p className="font-medium text-ink">{med.medicineName}</p>
                            <p className="text-ink-400 text-xs mt-0.5">
                              {med.dosage} · {med.frequency} · {med.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {rx.followUpInstructions && (
                      <p className="text-sm text-ink-600 bg-lavender-50 rounded-lg px-3 py-2 mb-4">
                        {rx.followUpInstructions}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleDownload(rx.prescriptionId)}
                        isLoading={downloadingId === rx.prescriptionId}
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </Button>
                      <Button variant="ghost" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" /> Print
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}