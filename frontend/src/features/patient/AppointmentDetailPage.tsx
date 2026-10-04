import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, addDays } from 'date-fns';
import {
  MapPin,
  Calendar,
  Clock,
  FileText,
  XCircle,
  ClipboardCheck,
  RefreshCw,
} from 'lucide-react';

import {
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
} from '@/api/appointmentApi';
import { getDoctorAvailability } from '@/api/doctorApi';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Avatar } from '@/components/shared/Avatar';
import { Loader } from '@/components/shared/Loader';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

// §13's appointment detail page.
// Cancel and reschedule are both handled inline rather than through
// separate routes.
export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointments', appointmentId],
    queryFn: () => getAppointmentById(appointmentId),
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => cancelAppointment(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowCancelForm(false);
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(
        err?.response?.data?.message ?? 'Could not cancel this appointment.'
      );
    },
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: [
      'doctors',
      appointment?.doctorProfileId,
      'availability',
      newDate,
    ],
    queryFn: () =>
      getDoctorAvailability(appointment!.doctorProfileId, newDate),
    enabled: showRescheduleForm && !!newDate && !!appointment,
  });

  const rescheduleMutation = useMutation({
    mutationFn: () =>
      rescheduleAppointment(appointmentId, {
        newDate,
        newTime: newTime!,
        reason: rescheduleReason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({
        queryKey: ['appointments', appointmentId],
      });

      setShowRescheduleForm(false);
      setNewDate('');
      setNewTime(null);
      setRescheduleReason('');
      setRescheduleError(null);
      setActionError(null);
    },
    onError: (err: any) => {
      setRescheduleError(
        err?.response?.data?.message ??
          'Could not reschedule this appointment.'
      );
    },
  });

  const dateOptions = Array.from({ length: 7 }, (_, i) =>
    addDays(new Date(), i + 1)
  );

  if (isLoading) return <Loader />;

  if (!appointment) {
    return (
      <div className="p-8 text-center text-danger-700">
        Appointment not found.
      </div>
    );
  }

  const canCancel =
    appointment.status === 'BOOKED' ||
    appointment.status === 'CONFIRMED';

  const isCompleted = appointment.status === 'COMPLETED';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-ink-400 hover:text-ink-600"
      >
        ← Back
      </button>

      <Card className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              photoUrl={appointment.profilePhotoUrl}
              name={appointment.doctorName}
              size="lg"
            />

            <div className="min-w-0">
              <p className="text-sm text-ink-400">Appointment</p>

              <h1 className="font-display text-xl sm:text-2xl text-ink mt-0.5 truncate">
                Dr. {appointment.doctorName}
              </h1>
            </div>
          </div>

          <div className="flex-shrink-0">
            <StatusBadge status={appointment.status} />
          </div>
        </div>

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

          <DetailRow
            icon={MapPin}
            label="Hospital"
            value={appointment.hospitalName}
          />

          {appointment.reasonForVisit && (
            <DetailRow
              icon={FileText}
              label="Reason for visit"
              value={appointment.reasonForVisit}
            />
          )}
        </div>

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

        {appointment.rescheduledBy && (
          <div className="mt-5 p-4 rounded-xl bg-lavender-50 text-sm text-ink-600">
            <p className="font-medium">Rescheduled</p>
            <p className="mt-0.5">
              Originally{' '}
              {appointment.originalDate &&
                format(
                  parseISO(appointment.originalDate),
                  'MMM d'
                )}{' '}
              at {appointment.originalTime}
            </p>
          </div>
        )}

        {/* Completed appointment → link to consultation record */}
        {isCompleted && (
          <Link to={`/patient/appointments/${appointment.id}/consultation`}>
            <Button variant="secondary" className="w-full mt-6">
              <ClipboardCheck className="w-4 h-4" />
              View Consultation Record
            </Button>
          </Link>
        )}

        {/* Cancel + Reschedule actions */}
        {canCancel && (
          <div className="mt-6 pt-6 border-t border-line space-y-4">
            <ErrorBanner message={actionError} />

            {/* Action buttons */}
            {!showCancelForm && !showRescheduleForm && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRescheduleForm(true);
                    setShowCancelForm(false);
                    setRescheduleError(null);
                    setActionError(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reschedule
                </Button>

                <Button
                  variant="danger"
                  onClick={() => {
                    setShowCancelForm(true);
                    setShowRescheduleForm(false);
                    setActionError(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Appointment
                </Button>
              </div>
            )}

            {/* Reschedule form */}
            {showRescheduleForm && (
              <div>
                <ErrorBanner message={rescheduleError} />

                <p className="text-sm font-medium text-ink-600 mb-2">
                  Select a new date
                </p>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {dateOptions.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = dateStr === newDate;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setNewDate(dateStr);
                          setNewTime(null);
                          setRescheduleError(null);
                        }}
                        className={`flex flex-col items-center px-4 py-2.5 rounded-xl border flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-teal-500 border-teal-500 text-white'
                            : 'border-line text-ink-600 hover:bg-cream-100'
                        }`}
                      >
                        <span className="text-xs opacity-80">
                          {format(date, 'EEE')}
                        </span>

                        <span className="font-medium">
                          {format(date, 'd MMM')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {newDate && (
                  <>
                    <p className="text-sm font-medium text-ink-600 mb-2">
                      Select a new time
                    </p>

                    {slotsLoading ? (
                      <Loader />
                    ) : !slots || slots.length === 0 ? (
                      <p className="text-sm text-ink-400 mb-4">
                        No slots available on this date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                        {slots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => {
                              setNewTime(slot.time);
                              setRescheduleError(null);
                            }}
                            className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                              !slot.available
                                ? 'bg-cream-200/60 text-ink-400/50 border-line cursor-not-allowed line-through'
                                : newTime === slot.time
                                ? 'bg-teal-500 border-teal-500 text-white'
                                : 'border-line text-ink-600 hover:bg-teal-50 hover:border-teal-200'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {newTime && (
                  <>
                    <label className="block text-sm font-medium text-ink-600 mb-1.5">
                      Reason for rescheduling
                    </label>

                    <textarea
                      value={rescheduleReason}
                      onChange={(e) => {
                        setRescheduleReason(e.target.value);
                        setRescheduleError(null);
                      }}
                      rows={2}
                      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
                      placeholder="Let us know why you're rescheduling..."
                    />

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        isLoading={rescheduleMutation.isPending}
                        disabled={!rescheduleReason.trim()}
                        onClick={() => rescheduleMutation.mutate()}
                        className="w-full sm:w-auto"
                      >
                        Confirm New Time
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowRescheduleForm(false);
                          setNewDate('');
                          setNewTime(null);
                          setRescheduleReason('');
                          setRescheduleError(null);
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Existing cancel form */}
            {showCancelForm && (
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1.5">
                  Reason for cancellation
                </label>

                <textarea
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    setActionError(null);
                  }}
                  rows={2}
                  className="w-full rounded-xl border border-line bg-white px-4 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
                  placeholder="Let us know why you're cancelling..."
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="danger"
                    isLoading={cancelMutation.isPending}
                    disabled={!cancelReason.trim()}
                    onClick={() => cancelMutation.mutate(cancelReason)}
                    className="w-full sm:w-auto"
                  >
                    Confirm Cancellation
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowCancelForm(false);
                      setActionError(null);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Never mind
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
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