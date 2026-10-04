
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  ClipboardCheck,
  ClipboardEdit,
  User,
} from 'lucide-react';

import { getAppointmentById } from '@/api/appointmentApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Loader } from '@/components/shared/Loader';

// Doctor's view of one appointment — deliberately different from the
// patient's AppointmentDetailPage. The doctor's version has a different
// primary action: Start/Continue Consultation instead of Cancel.
export default function DoctorAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);
  const navigate = useNavigate();

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointments', appointmentId],
    queryFn: () => getAppointmentById(appointmentId),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!appointment) {
    return (
      <div className="p-8 text-center text-danger-700">
        Appointment not found.
      </div>
    );
  }

  const canStartConsultation =
    appointment.status === 'BOOKED' ||
    appointment.status === 'CONFIRMED' ||
    appointment.status === 'IN_PROGRESS';

  const isCompleted = appointment.status === 'COMPLETED';

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-ink-400 hover:text-ink-600"
      >
        ← Back
      </button>

      {/* Appointment details */}
      <Card className="p-7">
        {/* Patient header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sage-50 flex items-center justify-center text-sage-500 flex-shrink-0">
              <User className="w-5 h-5" />
            </div>

            <div>
              <p className="text-sm text-ink-400">Patient</p>
              <h1 className="font-display text-xl text-ink">
                {appointment.patientName}
              </h1>
            </div>
          </div>

          <StatusBadge status={appointment.status} />
        </div>

        {/* Appointment information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-line">
          <DetailRow
            icon={Calendar}
            label="Date"
            value={format(
              parseISO(appointment.appointmentDate),
              'EEEE, MMM d, yyyy'
            )}
          />

          <DetailRow
            icon={Clock}
            label="Time"
            value={appointment.appointmentTime}
          />

          {appointment.reasonForVisit && (
            <DetailRow
              icon={FileText}
              label="Reason for visit"
              value={appointment.reasonForVisit}
            />
          )}
        </div>

        {/* Cancellation information */}
        {appointment.status === 'CANCELLED' &&
          appointment.cancellationReason && (
            <div className="mt-5 p-4 rounded-xl bg-danger-50 text-sm text-danger-700">
              <p className="font-medium">
                Cancelled by {appointment.cancelledBy?.toLowerCase()}
              </p>

              <p className="mt-0.5">
                {appointment.cancellationReason}
              </p>
            </div>
          )}

        {/* Start / Continue Consultation */}
        {canStartConsultation && (
          <Link
            to={`/doctor/appointments/${appointment.id}/consultation`}
          >
            <Button className="w-full mt-6">
              <ClipboardEdit className="w-4 h-4" />

              {appointment.status === 'IN_PROGRESS'
                ? 'Continue Consultation'
                : 'Start Consultation'}
            </Button>
          </Link>
        )}

        {/* Completed consultation */}
        {isCompleted && (
          <Link
            to={`/doctor/appointments/${appointment.id}/consultation-view`}
          >
            <Button variant="secondary" className="w-full mt-6">
              <ClipboardCheck className="w-4 h-4" />
              View Completed Record
            </Button>
          </Link>
        )}
      </Card>

      {/* Patient medical history */}
      <Link
        to={`/doctor/patients/${appointment.patientProfileId}/history`}
        className="block"
      >
        <Card
          hoverable
          className="p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-500" />

            <p className="text-sm font-medium text-ink">
              View {appointment.patientName}'s medical history
            </p>
          </div>

          <span className="text-teal-500 text-sm">→</span>
        </Card>
      </Link>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0"
        strokeWidth={1.75}
      />

      <div>
        <p className="text-xs text-ink-400">{label}</p>

        <p className="text-sm text-ink font-medium mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

