package com.healthcareapp.appointment.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.healthcareapp.appointment.Appointment;
import com.healthcareapp.appointment.AppointmentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {

    private Long id;

    // Patient details
    private Long patientProfileId;
    private String patientName;

    // Doctor and hospital details
    private Long doctorProfileId;
    private String doctorName;
    private String profilePhotoUrl;
    private String hospitalName;

    // Appointment details
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reasonForVisit;
    private AppointmentStatus status;

    // Cancellation details
    private String cancelledBy;
    private String cancellationReason;
    private LocalDateTime cancelledAt;

    // Rescheduling details
    private LocalDate originalDate;
    private LocalTime originalTime;
    private String rescheduledBy;
    private String rescheduleReason;

    private LocalDateTime createdAt;

    public static AppointmentResponse fromEntity(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())

                // Patient details
                .patientProfileId(appointment.getPatientProfile().getId())
                .patientName(
                        appointment.getPatientProfile()
                                .getUser()
                                .getFullName()
                )

                // Doctor and hospital details
                .doctorProfileId(appointment.getDoctorProfile().getId())
                .doctorName(
                        appointment.getDoctorProfile()
                                .getUser()
                                .getFullName()
                )
                .profilePhotoUrl(
                        appointment.getDoctorProfile().getProfilePhotoUrl()
                )
                .hospitalName(appointment.getHospital().getName())

                // Appointment details
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .reasonForVisit(appointment.getReasonForVisit())
                .status(appointment.getStatus())

                // Cancellation details
                .cancelledBy(appointment.getCancelledBy())
                .cancellationReason(appointment.getCancellationReason())
                .cancelledAt(appointment.getCancelledAt())

                // Rescheduling details
                .originalDate(appointment.getOriginalDate())
                .originalTime(appointment.getOriginalTime())
                .rescheduledBy(appointment.getRescheduledBy())
                .rescheduleReason(appointment.getRescheduleReason())

                .createdAt(appointment.getCreatedAt())
                .build();
    }
}