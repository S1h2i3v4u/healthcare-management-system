package com.healthcareapp.appointment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcareapp.appointment.dto.AppointmentResponse;
import com.healthcareapp.appointment.dto.BookAppointmentRequest;
import com.healthcareapp.appointment.dto.CancelRequest;
import com.healthcareapp.appointment.dto.RescheduleRequest;
import com.healthcareapp.audit.AuditService;
import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.doctor.DoctorProfile;
import com.healthcareapp.doctor.DoctorProfileRepository;
import com.healthcareapp.doctor.VerificationStatus;
import com.healthcareapp.hospital.Hospital;
import com.healthcareapp.hospital.HospitalRepository;
import com.healthcareapp.notification.Notification;
import com.healthcareapp.notification.NotificationService;
import com.healthcareapp.patient.PatientProfile;
import com.healthcareapp.patient.PatientProfileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final HospitalRepository hospitalRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    // ============================================================
    // BOOK APPOINTMENT - PATIENT
    // ============================================================

    @Transactional
    public AppointmentResponse bookAppointment(
            Long patientUserId,
            BookAppointmentRequest request) {

        PatientProfile patient = patientProfileRepository
                .findByUserId(patientUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient profile not found"));

        DoctorProfile doctor = doctorProfileRepository
                .findById(request.getDoctorProfileId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"));

        if (doctor.getVerificationStatus()
                != VerificationStatus.VERIFIED) {

            throw new ConflictException(
                    "This doctor is not currently accepting appointments");
        }

        Hospital hospital = hospitalRepository
                .findById(request.getHospitalId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hospital not found"));

        appointmentRepository.findActiveAppointmentForSlot(
                doctor.getId(),
                request.getAppointmentDate(),
                request.getAppointmentTime()
        ).ifPresent(existing -> {
            throw new ConflictException(
                    "This slot has just been booked. Please choose another time.");
        });

        Appointment appointment = Appointment.builder()
                .patientProfile(patient)
                .doctorProfile(doctor)
                .hospital(hospital)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .reasonForVisit(request.getReasonForVisit())
                .status(AppointmentStatus.BOOKED)
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        auditService.writeAuditLog(
                patientUserId,
                "PATIENT",
                "APPOINTMENT_BOOKED",
                "Appointment",
                saved.getId(),
                null
        );

        notificationService.createNotification(
                doctor.getUser().getId(),
                "New Appointment",
                "You have a new appointment with "
                        + patient.getUser().getFullName()
                        + " on "
                        + request.getAppointmentDate()
                        + " at "
                        + request.getAppointmentTime(),
                Notification.NotificationType.NEW_APPOINTMENT
        );

        notificationService.createNotification(
                patientUserId,
                "Appointment Booked",
                "Your appointment with Dr. "
                        + doctor.getUser().getFullName()
                        + " is booked for "
                        + request.getAppointmentDate()
                        + " at "
                        + request.getAppointmentTime(),
                Notification.NotificationType.APPOINTMENT_BOOKED
        );

        return AppointmentResponse.fromEntity(saved);
    }


    // ============================================================
    // GET MY APPOINTMENTS - PATIENT
    // ============================================================

    public List<AppointmentResponse> getMyAppointmentsAsPatient(
            Long patientUserId) {

        PatientProfile patient = patientProfileRepository
                .findByUserId(patientUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient profile not found"));

        return appointmentRepository
                .findByPatientProfileIdOrderByAppointmentDateDescAppointmentTimeDesc(
                        patient.getId()
                )
                .stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET MY APPOINTMENTS - DOCTOR
    // ============================================================

    public List<AppointmentResponse> getMyAppointmentsAsDoctor(
            Long doctorUserId) {

        DoctorProfile doctor = doctorProfileRepository
                .findByUserId(doctorUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found"));

        return appointmentRepository
                .findByDoctorProfileIdOrderByAppointmentDateDescAppointmentTimeDesc(
                        doctor.getId()
                )
                .stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET APPOINTMENT BY ID
    // ============================================================

    public AppointmentResponse getAppointmentById(
            Long appointmentId) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment not found"));

        return AppointmentResponse.fromEntity(appointment);
    }


    // ============================================================
    // CANCELLABLE APPOINTMENT STATUSES
    // ============================================================

    private static final Set<AppointmentStatus> CANCELLABLE_STATUSES =
            Set.of(
                    AppointmentStatus.BOOKED,
                    AppointmentStatus.CONFIRMED
            );


    // ============================================================
    // CANCEL APPOINTMENT
    // ============================================================

    @Transactional
    public AppointmentResponse cancelAppointment(
            Long appointmentId,
            Long cancelledByUserId,
            String cancelledByRole,
            CancelRequest request) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment not found"));

        if (!CANCELLABLE_STATUSES.contains(
                appointment.getStatus())) {

            throw new ConflictException(
                    "Cannot cancel an appointment with status "
                            + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledBy(cancelledByRole);
        appointment.setCancellationReason(request.getReason());
        appointment.setCancelledAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);

        auditService.writeAuditLog(
                cancelledByUserId,
                cancelledByRole,
                "APPOINTMENT_CANCELLED",
                "Appointment",
                saved.getId(),
                request.getReason()
        );

        Long notifyUserId =
                cancelledByRole.equals("PATIENT")
                        ? appointment.getDoctorProfile()
                                .getUser()
                                .getId()
                        : appointment.getPatientProfile()
                                .getUser()
                                .getId();

        notificationService.createNotification(
                notifyUserId,
                "Appointment Cancelled",
                "Your appointment on "
                        + appointment.getAppointmentDate()
                        + " was cancelled. Reason: "
                        + request.getReason(),
                Notification.NotificationType.APPOINTMENT_CANCELLED
        );

        return AppointmentResponse.fromEntity(saved);
    }


    // ============================================================
    // RESCHEDULE APPOINTMENT
    // ============================================================

    @Transactional
    public AppointmentResponse rescheduleAppointment(
            Long appointmentId,
            String rescheduledByRole,
            RescheduleRequest request) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment not found"));

        if (!CANCELLABLE_STATUSES.contains(
                appointment.getStatus())) {

            throw new ConflictException(
                    "Cannot reschedule an appointment with status "
                            + appointment.getStatus());
        }

        appointmentRepository.findActiveAppointmentForSlot(
                appointment.getDoctorProfile().getId(),
                request.getNewDate(),
                request.getNewTime()
        ).ifPresent(existing -> {
            throw new ConflictException(
                    "The new slot is already booked. Please choose another time.");
        });

        appointment.setOriginalDate(
                appointment.getAppointmentDate());

        appointment.setOriginalTime(
                appointment.getAppointmentTime());

        appointment.setAppointmentDate(
                request.getNewDate());

        appointment.setAppointmentTime(
                request.getNewTime());

        appointment.setRescheduledBy(
                rescheduledByRole);

        appointment.setRescheduleReason(
                request.getReason());

        appointment.setRescheduledAt(
                LocalDateTime.now());

        Appointment saved =
                appointmentRepository.save(appointment);

        return AppointmentResponse.fromEntity(saved);
    }
}

