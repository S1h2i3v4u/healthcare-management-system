import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import {
  BadgeCheck,
  MapPin,
  IndianRupee,
  GraduationCap,
  Clock,
  CheckCircle2,
} from 'lucide-react';

import { getDoctorById, getDoctorAvailability } from '@/api/doctorApi';
import { bookAppointment } from '@/api/appointmentApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Avatar } from '@/components/shared/Avatar';

export default function DoctorProfileBookingPage() {
  const { id } = useParams<{ id: string }>();
  const doctorId = Number(id);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // =========================
  // DOCTOR PROFILE
  // =========================

  const {
    data: doctor,
    isLoading: doctorLoading,
  } = useQuery({
    queryKey: ['doctors', doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: Number.isFinite(doctorId) && doctorId > 0,
  });

  // =========================
  // DOCTOR AVAILABILITY
  // =========================

  const {
    data: slots,
    isLoading: slotsLoading,
  } = useQuery({
    queryKey: [
      'doctors',
      doctorId,
      'availability',
      selectedDate,
    ],
    queryFn: () => getDoctorAvailability(doctorId, selectedDate),
    enabled: Number.isFinite(doctorId) && doctorId > 0,
  });

  // =========================
  // BOOK APPOINTMENT
  // =========================

  const bookingMutation = useMutation({
    mutationFn: bookAppointment,

    onSuccess: (appointment) => {
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });

      navigate(`/patient/appointments/${appointment.id}`);
    },

    onError: (err: any) => {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message;

      setBookingError(
        backendMessage ||
          'Could not book this slot. Please try another.'
      );
    },
  });

  // =========================
  // BOOKING HANDLER
  // =========================

  const handleBook = () => {
    if (!selectedTime || !doctor) {
      return;
    }

    setBookingError(null);

    /*
     * A doctor can currently be linked to one or more hospitals.
     * The booking API requires hospitalId, so use the first
     * hospital linked to this doctor.
     */
    const hospitalId = doctor.hospitalIds?.[0];

    if (!hospitalId) {
      setBookingError(
        'This doctor is not currently linked to a hospital. Please choose another doctor.'
      );
      return;
    }

    bookingMutation.mutate({
      doctorProfileId: doctorId,
      hospitalId,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      reasonForVisit: reason.trim() || undefined,
    });
  };

  // =========================
  // DATE OPTIONS
  // =========================

  const dateOptions = Array.from(
    { length: 7 },
    (_, i) => addDays(new Date(), i)
  );

  // =========================
  // LOADING / NOT FOUND
  // =========================

  if (doctorLoading) {
    return <Loader />;
  }

  if (!doctor) {
    return (
      <div className="p-8 text-center text-danger-700">
        Doctor not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

      {/* =========================
          DOCTOR PROFILE
      ========================= */}

      <Card className="p-5 sm:p-7">
        <div className="flex items-start gap-4 sm:gap-5">

          {/* Avatar */}
          <Avatar
            photoUrl={doctor.profilePhotoUrl}
            name={doctor.fullName}
            size="xl"
          />

          <div className="flex-1 min-w-0">

            {/* Name */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl text-ink">
                Dr. {doctor.fullName}
              </h1>

              {doctor.verificationStatus === 'VERIFIED' && (
                <BadgeCheck className="w-5 h-5 text-teal-500 flex-shrink-0" />
              )}
            </div>

            {/* Specialization */}
            <p className="text-ink-600 mt-1">
              {doctor.specialization}
            </p>

            {/* Details */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-ink-400">

              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {doctor.medicalQualification}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {doctor.yearsOfExperience} years experience
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {doctor.city}
              </span>

              <span className="flex items-center gap-1 font-medium text-ink">
                <IndianRupee className="w-3.5 h-3.5" />
                {doctor.consultationFee} consultation fee
              </span>

            </div>

            {/* Hospitals */}
            {doctor.hospitalNames?.length > 0 && (
              <p className="text-sm text-ink-400 mt-2">
                Practices at {doctor.hospitalNames.join(', ')}
              </p>
            )}

            {/* Bio */}
            {doctor.professionalBio && (
              <p className="text-sm text-ink-600 mt-4 leading-relaxed">
                {doctor.professionalBio}
              </p>
            )}

          </div>
        </div>
      </Card>

      {/* =========================
          BOOKING CARD
      ========================= */}

      <Card className="p-5 sm:p-7">

        <h2 className="font-display text-xl text-ink mb-4">
          Book an Appointment
        </h2>

        <ErrorBanner message={bookingError} />

        {/* =========================
            DATE PICKER
        ========================= */}

        <p className="text-sm font-medium text-ink-600 mb-2">
          Select a date
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">

          {dateOptions.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(dateStr);
                  setSelectedTime(null);
                  setBookingError(null);
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

        {/* =========================
            TIME SLOTS
        ========================= */}

        <p className="text-sm font-medium text-ink-600 mb-2">
          Select a time
        </p>

        {slotsLoading ? (
          <Loader />
        ) : !slots || slots.length === 0 ? (
          <EmptyState
            icon={Clock}
            message="No slots available on this date"
            subtext="Try selecting a different day."
          />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">

            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => {
                  setSelectedTime(slot.time);
                  setBookingError(null);
                }}
                className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                  !slot.available
                    ? 'bg-cream-200/60 text-ink-400/50 border-line cursor-not-allowed line-through'
                    : selectedTime === slot.time
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'border-line text-ink-600 hover:bg-teal-50 hover:border-teal-200'
                }`}
              >
                {slot.time}
              </button>
            ))}

          </div>
        )}

        {/* =========================
            BOOKING CONFIRMATION
        ========================= */}

        {selectedTime && (
          <div className="animate-in fade-in duration-200">

            {/* Reason */}
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              Reason for visit (optional)
            </label>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-line bg-white px-4 py-2.5 mb-5 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
              placeholder="Briefly describe your symptoms or reason for the visit..."
            />

            {/* Selected appointment summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sage-50 rounded-xl p-4 mb-5">

              <div className="flex items-center gap-2 text-sm text-ink-600">
                <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />

                {format(
                  new Date(selectedDate),
                  'EEEE, MMM d'
                )}{' '}
                at {selectedTime}
              </div>

              <p className="font-medium text-ink flex items-center">
                <IndianRupee className="w-3.5 h-3.5" />
                {doctor.consultationFee}
              </p>

            </div>

            {/* Confirm booking */}
            <Button
              type="button"
              onClick={handleBook}
              isLoading={bookingMutation.isPending}
              className="w-full"
            >
              Confirm Booking
            </Button>

          </div>
        )}

      </Card>
    </div>
  );
}