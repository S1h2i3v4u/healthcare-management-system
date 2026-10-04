import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Activity, Stethoscope, Pill, FileText, Download, Paperclip, Heart, Thermometer, ClipboardList } from 'lucide-react';
import { getConsultationByAppointmentId, getDocumentsForAppointment, downloadDocument } from '@/api/consultationApi';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/shared/Loader';

// Doctor's read-only view of a LOCKED consultation they completed — a
// near-mirror of the patient's ConsultationRecordPage. Kept as its OWN
// component rather than a shared one with a role prop, same reasoning
// applied at DoctorAppointmentDetailPage: the two pages sit behind
// different RoleRoute guards and different route paths, and forcing one
// component to serve both would mean threading a role flag through every
// section just to decide which "back" link or wrapper page it's nested
// under. Some duplication here is the more maintainable choice, not an
// oversight — the content rendering itself is intentionally near-identical
// since it's the same underlying data.
export default function DoctorConsultationViewPage() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);
  const navigate = useNavigate();

  const { data: consultation, isLoading } = useQuery({
    queryKey: ['consultations', appointmentId],
    queryFn: () => getConsultationByAppointmentId(appointmentId),
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', appointmentId],
    queryFn: () => getDocumentsForAppointment(appointmentId),
  });

  if (isLoading) return <Loader />;
  if (!consultation) return <div className="p-8 text-center text-danger-700">Consultation record not found.</div>;

  const vitals = consultation.vitals;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-ink-400 hover:text-ink-600">
        ← Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-400">Consultation Record</p>
          <h1 className="font-display text-2xl text-ink mt-0.5">
            {consultation.completedAt && format(parseISO(consultation.completedAt), 'EEEE, MMM d, yyyy')}
          </h1>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-success-700 bg-success-50 px-3 py-1.5 rounded-full">
          🔒 Finalized Medical Record
        </span>
      </div>

      {consultation.chiefComplaint && (
        <Card className="p-6">
          <SectionHeader icon={ClipboardList} title="Chief Complaint" />
          <p className="text-sm text-ink-600">{consultation.chiefComplaint}</p>
          {consultation.symptoms && <p className="text-sm text-ink-400 mt-2">Symptoms: {consultation.symptoms}</p>}
        </Card>
      )}

      {consultation.diagnosis && (
        <Card className="p-6">
          <SectionHeader icon={Stethoscope} title="Diagnosis" />
          <p className="font-medium text-ink">{consultation.diagnosis.diagnosisName}</p>
          {consultation.diagnosis.diagnosisDescription && (
            <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{consultation.diagnosis.diagnosisDescription}</p>
          )}
          {consultation.diagnosis.icdCode && (
            <p className="text-xs text-ink-400 mt-1.5">ICD Code: {consultation.diagnosis.icdCode}</p>
          )}
        </Card>
      )}

      {vitals && (
        <Card className="p-6">
          <SectionHeader icon={Activity} title="Vitals" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {vitals.bloodPressure && <VitalStat icon={Heart} label="Blood Pressure" value={vitals.bloodPressure} />}
            {vitals.heartRate && <VitalStat icon={Activity} label="Heart Rate" value={`${vitals.heartRate} bpm`} />}
            {vitals.temperature && <VitalStat icon={Thermometer} label="Temperature" value={`${vitals.temperature}°`} />}
            {vitals.oxygenSaturation && <VitalStat icon={Activity} label="SpO2" value={`${vitals.oxygenSaturation}%`} />}
          </div>
        </Card>
      )}

      {consultation.examinationNotes && (
        <Card className="p-6">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1.5">Examination Notes</p>
          <p className="text-sm text-ink-600 leading-relaxed">{consultation.examinationNotes}</p>
        </Card>
      )}

      {consultation.prescriptionItems.length > 0 && (
        <Card className="p-6">
          <SectionHeader icon={Pill} title="Prescription" />
          <div className="space-y-3">
            {consultation.prescriptionItems.map((item, i) => (
              <div key={i} className="flex items-start justify-between py-2.5 border-b border-line last:border-0">
                <div>
                  <p className="font-medium text-ink text-sm">{item.medicineName}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{item.dosage} · {item.frequency} · {item.duration}</p>
                  {item.instructions && <p className="text-xs text-ink-400 mt-0.5">{item.instructions}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {consultation.medicalAdvice && (
        <Card className="p-6">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1.5">Medical Advice</p>
          <p className="text-sm text-ink-600 leading-relaxed">{consultation.medicalAdvice}</p>
        </Card>
      )}

      {consultation.followUpRequired && (
        <Card className="p-6 bg-lavender-50 border-lavender-200">
          <p className="text-sm font-medium text-ink">Follow-up recommended</p>
          {consultation.followUpDate && (
            <p className="text-sm text-ink-600 mt-1">on {format(parseISO(consultation.followUpDate), 'MMM d, yyyy')}</p>
          )}
          {consultation.followUpInstructions && <p className="text-sm text-ink-600 mt-1">{consultation.followUpInstructions}</p>}
        </Card>
      )}

      {documents && documents.length > 0 && (
        <Card className="p-6">
          <SectionHeader icon={Paperclip} title="Attached Documents" />
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => downloadDocument(doc.id, doc.originalFilename)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-line hover:bg-cream-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-teal-500" />
                  <div>
                    <p className="text-sm font-medium text-ink">{doc.originalFilename}</p>
                    <p className="text-xs text-ink-400">{doc.documentType.replace('_', ' ')}</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-ink-400" />
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-teal-500" strokeWidth={1.75} />
      <h2 className="font-medium text-ink">{title}</h2>
    </div>
  );
}

function VitalStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-400 flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</p>
      <p className="text-sm font-medium text-ink mt-0.5">{value}</p>
    </div>
  );
}