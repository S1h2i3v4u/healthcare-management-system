import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
} from 'lucide-react';

import {
  getConsultationByAppointmentId,
  getDocumentsForAppointment,
  uploadDocument,
  saveDraft,
  completeConsultation,
} from '@/api/consultationApi';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/shared/Loader';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

import type {
  PrescriptionItemInput,
  VitalsInput,
  DiagnosisInput,
} from '@/types';

// §16-18's active consultation form — the largest, highest-stakes page in
// the app: this is where a permanently-locked medical record originates.
// Local component state mirrors the backend's ConsultationDraftRequest
// shape closely, so "Save Draft" and "Complete" both submit essentially
// the same object, just to different endpoints with different validation.
export default function ActiveConsultationPage() {
  const { id } = useParams<{ id: string }>();

  const appointmentId = Number(id);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['consultations', appointmentId],
    queryFn: () =>
      getConsultationByAppointmentId(appointmentId),
    retry: false,
  });

  // ============================================================
  // CONSULTATION FORM STATE
  // ============================================================

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [examinationNotes, setExaminationNotes] = useState('');
  const [medicalAdvice, setMedicalAdvice] = useState('');
  const [followUpRequired, setFollowUpRequired] =
    useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpInstructions, setFollowUpInstructions] =
    useState('');

  const [vitals, setVitals] =
    useState<VitalsInput>({});

  const [diagnosis, setDiagnosis] =
    useState<DiagnosisInput>({
      diagnosisName: '',
    });

  const [items, setItems] =
    useState<PrescriptionItemInput[]>([]);

  // ============================================================
  // UI STATE
  // ============================================================

  const [saveMessage, setSaveMessage] =
    useState<string | null>(null);

  const [completeError, setCompleteError] =
    useState<string | null>(null);

  const [showCompleteConfirm, setShowCompleteConfirm] =
    useState(false);

  // ============================================================
  // DOCUMENT UPLOAD STATE
  // ============================================================

  const [documentType, setDocumentType] =
    useState('OTHER');

  const [uploadError, setUploadError] =
    useState<string | null>(null);

  // ============================================================
  // EXISTING DOCUMENTS
  // ============================================================

  const { data: documents } = useQuery({
    queryKey: ['documents', appointmentId],
    queryFn: () =>
      getDocumentsForAppointment(appointmentId),
  });

  // ============================================================
  // DOCUMENT UPLOAD MUTATION
  // ============================================================

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadDocument(
        appointmentId,
        file,
        documentType
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', appointmentId],
      });

      setUploadError(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },

    onError: (err: any) => {
      setUploadError(
        err?.response?.data?.message ??
          'Upload failed. Check file type and size.'
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
  });

  // ============================================================
  // FILE SELECTION
  // ============================================================

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setUploadError(null);
      uploadMutation.mutate(file);
    }
  };

  // ============================================================
  // PREFILL EXISTING DRAFT
  // ============================================================

  useEffect(() => {
    if (existing) {
      setChiefComplaint(
        existing.chiefComplaint ?? ''
      );

      setSymptoms(
        existing.symptoms ?? ''
      );

      setExaminationNotes(
        existing.examinationNotes ?? ''
      );

      setMedicalAdvice(
        existing.medicalAdvice ?? ''
      );

      setFollowUpRequired(
        existing.followUpRequired ?? false
      );

      setFollowUpDate(
        existing.followUpDate ?? ''
      );

      setFollowUpInstructions(
        existing.followUpInstructions ?? ''
      );

      if (existing.vitals) {
        setVitals(existing.vitals);
      }

      if (existing.diagnosis) {
        setDiagnosis(existing.diagnosis);
      }

      if (existing.prescriptionItems?.length) {
        setItems(existing.prescriptionItems);
      }
    }
  }, [existing]);

  // ============================================================
  // BUILD CONSULTATION PAYLOAD
  // ============================================================

  const buildPayload = () => ({
    chiefComplaint,
    symptoms,
    examinationNotes,
    medicalAdvice,
    followUpRequired,
    followUpDate:
      followUpDate || undefined,
    followUpInstructions,
    vitals,
    diagnosis,
    prescriptionItems: items,
  });

  // ============================================================
  // SAVE DRAFT
  // ============================================================

  const draftMutation = useMutation({
    mutationFn: () =>
      saveDraft(
        appointmentId,
        buildPayload()
      ),

    onSuccess: () => {
      setSaveMessage('Draft saved');

      setTimeout(
        () => setSaveMessage(null),
        2500
      );

      queryClient.invalidateQueries({
        queryKey: [
          'consultations',
          appointmentId,
        ],
      });
    },
  });

  // ============================================================
  // COMPLETE CONSULTATION
  // ============================================================

  const completeMutation = useMutation({
    mutationFn: () =>
      completeConsultation(
        appointmentId,
        buildPayload() as any
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });

      navigate(
        `/doctor/appointments/${appointmentId}`
      );
    },

    onError: (err: any) => {
      setCompleteError(
        err?.response?.data?.message ??
          'Could not complete this consultation.'
      );

      setShowCompleteConfirm(false);
    },
  });

  // ============================================================
  // PRESCRIPTION HELPERS
  // ============================================================

  const addMedicine = () =>
    setItems([
      ...items,
      {
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
      },
    ]);

  const removeMedicine = (i: number) =>
    setItems(
      items.filter(
        (_, idx) => idx !== i
      )
    );

  const updateMedicine = (
    i: number,
    field: keyof PrescriptionItemInput,
    value: string
  ) => {
    setItems(
      items.map(
        (item, idx) =>
          idx === i
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return <Loader />;
  }

  // ============================================================
  // LOCKED CONSULTATION
  // ============================================================

  if (existing?.status === 'LOCKED') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-ink font-medium">
          This consultation is already locked and finalized.
        </p>

        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5 pb-40 sm:pb-32">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <h1 className="font-display text-2xl text-ink">
          Active Consultation
        </h1>

        <p className="text-ink-400 mt-1">
          Fill in as you go — save a draft anytime,
          complete when finished.
        </p>
      </div>

      {/* ======================================================
          CHIEF COMPLAINT + SYMPTOMS
      ====================================================== */}

      <Card className="p-4 sm:p-6 space-y-4">
        <SectionTitle>
          Chief Complaint & Symptoms
        </SectionTitle>

        <TextArea
          label="Chief Complaint"
          value={chiefComplaint}
          onChange={setChiefComplaint}
          placeholder="e.g. Patient reports headache for 3 days."
        />

        <TextArea
          label="Symptoms"
          value={symptoms}
          onChange={setSymptoms}
          placeholder="List symptoms..."
          rows={2}
        />
      </Card>

      {/* ======================================================
          VITALS
      ====================================================== */}

      <Card className="p-4 sm:p-6 space-y-4">
        <SectionTitle>
          Vitals
        </SectionTitle>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          <Input
            label="Blood Pressure"
            placeholder="120/80"
            value={vitals.bloodPressure ?? ''}
            onChange={(e) =>
              setVitals({
                ...vitals,
                bloodPressure:
                  e.target.value,
              })
            }
          />

          <Input
            label="Heart Rate"
            type="number"
            value={vitals.heartRate ?? ''}
            onChange={(e) =>
              setVitals({
                ...vitals,
                heartRate:
                  Number(e.target.value) ||
                  undefined,
              })
            }
          />

          <Input
            label="Temperature"
            type="number"
            step="0.1"
            value={vitals.temperature ?? ''}
            onChange={(e) =>
              setVitals({
                ...vitals,
                temperature:
                  Number(e.target.value) ||
                  undefined,
              })
            }
          />

          <Input
            label="SpO2 %"
            type="number"
            value={
              vitals.oxygenSaturation ?? ''
            }
            onChange={(e) =>
              setVitals({
                ...vitals,
                oxygenSaturation:
                  Number(e.target.value) ||
                  undefined,
              })
            }
          />

          <Input
            label="Resp. Rate"
            type="number"
            value={
              vitals.respiratoryRate ?? ''
            }
            onChange={(e) =>
              setVitals({
                ...vitals,
                respiratoryRate:
                  Number(e.target.value) ||
                  undefined,
              })
            }
          />

          <Input
            label="Height (cm)"
            type="number"
            value={
              vitals.heightCm ?? ''
            }
            onChange={(e) =>
              setVitals({
                ...vitals,
                heightCm:
                  Number(e.target.value) ||
                  undefined,
              })
            }
          />

          <Input
            label="Weight (kg)"
            type="number"
            value={
              vitals.weightKg ?? ''
            }
            onChange={(e) =>
              setVitals({
                ...vitals,
                weightKg:
                  Number(e.target.value) ||
                  undefined,
              })
            }
          />

        </div>
      </Card>

      {/* ======================================================
          EXAMINATION
      ====================================================== */}

      <Card className="p-4 sm:p-6 space-y-4">
        <SectionTitle>
          Examination Notes
        </SectionTitle>

        <TextArea
          label=""
          value={examinationNotes}
          onChange={setExaminationNotes}
          rows={4}
          placeholder="Detailed examination findings..."
        />
      </Card>

      {/* ======================================================
          DIAGNOSIS
      ====================================================== */}

      <Card className="p-4 sm:p-6 space-y-4">
        <SectionTitle>
          Diagnosis
        </SectionTitle>

        <Input
          label="Diagnosis Name"
          value={diagnosis.diagnosisName}
          onChange={(e) =>
            setDiagnosis({
              ...diagnosis,
              diagnosisName:
                e.target.value,
            })
          }
        />

        <TextArea
          label="Description"
          value={
            diagnosis.diagnosisDescription ??
            ''
          }
          onChange={(v) =>
            setDiagnosis({
              ...diagnosis,
              diagnosisDescription: v,
            })
          }
          rows={2}
        />

        <Input
          label="ICD Code (optional)"
          value={
            diagnosis.icdCode ?? ''
          }
          onChange={(e) =>
            setDiagnosis({
              ...diagnosis,
              icdCode:
                e.target.value,
            })
          }
        />
      </Card>

      {/* ======================================================
          PRESCRIPTION
      ====================================================== */}

      <Card className="p-4 sm:p-6 space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <SectionTitle>
            Prescription
          </SectionTitle>

          <Button
            variant="secondary"
            onClick={addMedicine}
            className="!py-1.5 !px-3 text-xs w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Medicine
          </Button>

        </div>

        {items.length === 0 && (
          <p className="text-sm text-ink-400 text-center py-4">
            No medicines added yet.
          </p>
        )}

        {items.map((item, i) => (
          <div
            key={i}
            className="p-3 sm:p-4 rounded-xl border border-line space-y-3 relative"
          >

            <button
              onClick={() =>
                removeMedicine(i)
              }
              className="absolute top-3 right-3 text-ink-400 hover:text-danger-500"
              type="button"
              aria-label={`Remove medicine ${i + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Mobile: one column
                Desktop: two columns */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">

              <Input
                label="Medicine Name"
                value={item.medicineName}
                onChange={(e) =>
                  updateMedicine(
                    i,
                    'medicineName',
                    e.target.value
                  )
                }
              />

              <Input
                label="Dosage"
                placeholder="500 mg"
                value={item.dosage}
                onChange={(e) =>
                  updateMedicine(
                    i,
                    'dosage',
                    e.target.value
                  )
                }
              />

              <Input
                label="Frequency"
                placeholder="Twice daily"
                value={item.frequency}
                onChange={(e) =>
                  updateMedicine(
                    i,
                    'frequency',
                    e.target.value
                  )
                }
              />

              <Input
                label="Duration"
                placeholder="5 days"
                value={item.duration}
                onChange={(e) =>
                  updateMedicine(
                    i,
                    'duration',
                    e.target.value
                  )
                }
              />

            </div>

            <Input
              label="Instructions"
              placeholder="After food"
              value={
                item.instructions ?? ''
              }
              onChange={(e) =>
                updateMedicine(
                  i,
                  'instructions',
                  e.target.value
                )
              }
            />

          </div>
        ))}
      </Card>

      {/* ======================================================
          ATTACHMENTS
          §16.I — LAB REPORTS / SCANS
      ====================================================== */}

      <Card className="p-4 sm:p-6 space-y-4">

        <SectionTitle>
          Attachments
        </SectionTitle>

        <ErrorBanner
          message={uploadError}
        />

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">

          <Select
            label=""
            options={[
              {
                value: 'BLOOD_TEST',
                label: 'Blood Test',
              },
              {
                value: 'URINE_TEST',
                label: 'Urine Test',
              },
              {
                value: 'X_RAY',
                label: 'X-Ray',
              },
              {
                value: 'MRI',
                label: 'MRI',
              },
              {
                value: 'CT_SCAN',
                label: 'CT Scan',
              },
              {
                value: 'PRESCRIPTION',
                label: 'Prescription',
              },
              {
                value: 'OTHER',
                label: 'Other',
              },
            ]}
            value={documentType}
            onChange={(e) =>
              setDocumentType(
                e.target.value
              )
            }
            className="!py-2"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            variant="secondary"
            onClick={() =>
              fileInputRef.current?.click()
            }
            isLoading={
              uploadMutation.isPending
            }
            type="button"
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </Button>

        </div>

        {/* Existing uploaded documents */}

        {documents &&
          documents.length > 0 && (
            <div className="space-y-2 pt-2">

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-line"
                >

                  <div className="flex items-center gap-2.5 min-w-0">

                    <FileText className="w-4 h-4 text-teal-500 shrink-0" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {doc.originalFilename}
                      </p>

                      <p className="text-xs text-ink-400">
                        {doc.documentType.replace(
                          '_',
                          ' '
                        )}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

      </Card>

      {/* ======================================================
          ADVICE + FOLLOW-UP
      ====================================================== */}

      <Card className="p-4 sm:p-6 space-y-4">

        <SectionTitle>
          Advice & Follow-up
        </SectionTitle>

        <TextArea
          label="Medical Advice"
          value={medicalAdvice}
          onChange={setMedicalAdvice}
          rows={2}
        />

        <label className="flex items-center gap-2 text-sm text-ink-600">

          <input
            type="checkbox"
            checked={followUpRequired}
            onChange={(e) =>
              setFollowUpRequired(
                e.target.checked
              )
            }
            className="rounded border-line text-teal-500 focus:ring-teal-400"
          />

          Follow-up required

        </label>

        {followUpRequired && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <Input
              label="Follow-up Date"
              type="date"
              value={followUpDate}
              onChange={(e) =>
                setFollowUpDate(
                  e.target.value
                )
              }
            />

            <Input
              label="Instructions"
              value={followUpInstructions}
              onChange={(e) =>
                setFollowUpInstructions(
                  e.target.value
                )
              }
            />

          </div>
        )}

      </Card>

      {/* ======================================================
          STICKY ACTION BAR
      ====================================================== */}

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-line px-4 sm:px-6 py-3 sm:py-4 z-40">

        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">

          {/* Save status */}

          <div className="flex items-center justify-center sm:justify-start gap-3 order-2 sm:order-1 min-h-5">

            {saveMessage && (
              <span className="text-sm text-success-700 flex items-center gap-1 text-center">

                <CheckCircle2 className="w-4 h-4 shrink-0" />

                {saveMessage}

              </span>
            )}

          </div>

          {/* Action buttons */}

          <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">

            <Button
              variant="secondary"
              onClick={() =>
                draftMutation.mutate()
              }
              isLoading={
                draftMutation.isPending
              }
              className="flex-1 sm:flex-initial"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>

            <Button
              onClick={() =>
                setShowCompleteConfirm(true)
              }
              className="flex-1 sm:flex-initial"
            >
              Complete Appointment
            </Button>

          </div>

        </div>

      </div>

      {/* ======================================================
          COMPLETION CONFIRMATION MODAL
          §18
      ====================================================== */}

      {showCompleteConfirm && (
        <div
          className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 sm:px-6"
          onClick={() =>
            setShowCompleteConfirm(false)
          }
        >

          <div
            className="bg-white rounded-xl2 p-5 sm:p-7 max-w-md w-full"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-center gap-2 text-warning-700 mb-3">

              <AlertTriangle className="w-5 h-5 shrink-0" />

              <p className="font-medium">
                This action is permanent
              </p>

            </div>

            <p className="text-sm text-ink-600 mb-5">
              After completing this appointment,
              the consultation record will be permanently
              locked and cannot be edited. Please verify
              all information before continuing.
            </p>

            <ErrorBanner
              message={completeError}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-2">

              <Button
                onClick={() =>
                  completeMutation.mutate()
                }
                isLoading={
                  completeMutation.isPending
                }
                className="flex-1"
              >
                Complete Appointment
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  setShowCompleteConfirm(false)
                }
              >
                Cancel
              </Button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="font-medium text-ink">
      {children}
    </h2>
  );
}

// ============================================================
// TEXT AREA
// ============================================================

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>

      {label && (
        <label className="block text-sm font-medium text-ink-600 mb-1.5">
          {label}
        </label>
      )}

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
      />

    </div>
  );
}