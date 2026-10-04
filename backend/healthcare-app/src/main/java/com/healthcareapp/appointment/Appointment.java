package com.healthcareapp.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.healthcareapp.doctor.DoctorProfile;
import com.healthcareapp.hospital.Hospital;
import com.healthcareapp.patient.PatientProfile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "appointments",
        indexes = {
                @Index(
                        name = "idx_doctor_date_time",
                        columnList = "doctor_profile_id, appointment_date, appointment_time"
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_profile_id", nullable = false)
    private PatientProfile patientProfile;

    @ManyToOne
    @JoinColumn(name = "doctor_profile_id", nullable = false)
    private DoctorProfile doctorProfile;

    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    // Inverse side of Consultation's @OneToOne.
    // Consultation owns the foreign key.
    @OneToOne(
            mappedBy = "appointment",
            fetch = FetchType.LAZY
    )
    private com.healthcareapp.consultation.Consultation consultation;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "reason_for_visit", columnDefinition = "TEXT")
    private String reasonForVisit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.BOOKED;

    // ============================================================
    // Cancellation fields
    // ============================================================

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    // ============================================================
    // Reschedule fields
    // ============================================================

    @Column(name = "original_date")
    private LocalDate originalDate;

    @Column(name = "original_time")
    private LocalTime originalTime;

    @Column(name = "rescheduled_by")
    private String rescheduledBy;

    @Column(name = "reschedule_reason", columnDefinition = "TEXT")
    private String rescheduleReason;

    @Column(name = "rescheduled_at")
    private LocalDateTime rescheduledAt;

    // ============================================================
    // Scheduled reminder fields
    // ============================================================

    /*
     * Tracks whether the 24-hour reminder has already been sent.
     *
     * This prevents ReminderScheduler from sending the same
     * notification repeatedly every 15 minutes.
     */
    @Column(name = "reminder_24h_sent", nullable = false)
    @Builder.Default
    private boolean reminder24hSent = false;

    /*
     * Tracks whether the 1-hour reminder has already been sent.
     *
     * This prevents ReminderScheduler from sending the same
     * notification repeatedly every 15 minutes.
     */
    @Column(name = "reminder_1h_sent", nullable = false)
    @Builder.Default
    private boolean reminder1hSent = false;

    // ============================================================
    // JPA Auditing
    // ============================================================

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}