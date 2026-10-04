package com.healthcareapp.consultation;

import com.healthcareapp.appointment.Appointment;
import com.healthcareapp.doctor.DoctorProfile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@EntityListeners({AuditingEntityListener.class, ConsultationLockListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One consultation per appointment — enforced via unique FK.
    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "doctor_profile_id", nullable = false)
    private DoctorProfile doctorProfile;

    // ===== §16 sections kept as flat columns — simpler nested data that
    // doesn't warrant its own entity/table. Vitals, Diagnosis, and
    // Prescription DO get their own entities (built next), since they have
    // their own multi-field structure and are referenced elsewhere (§21's
    // history timeline shows diagnosis/prescription independently). =====

    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms; // stored as a simple delimited/free-text list

    @Column(name = "examination_notes", columnDefinition = "TEXT")
    private String examinationNotes;

    @Column(name = "medical_advice", columnDefinition = "TEXT")
    private String medicalAdvice;

    // ===== Follow-up (§16.H) =====
    @Column(name = "follow_up_required")
    private Boolean followUpRequired;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "follow_up_instructions", columnDefinition = "TEXT")
    private String followUpInstructions;

    // ===== The immutability core (§17-19) =====
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ConsultationStatus status = ConsultationStatus.DRAFT;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Redundant with doctorProfile above, but explicitly named per §18's
    // "Store doctor ID" requirement at completion time — kept as a distinct,
    // clearly-named field so the audit trail is unambiguous even if
    // doctorProfile were ever reassigned (it shouldn't be, but this makes
    // the completion record self-contained).
    @Column(name = "completed_by_doctor_id")
    private Long completedByDoctorId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

        // NOT persisted to the database — this is populated by @PostLoad in
    // ConsultationLockListener purely to remember "what status was this row
    // in when it was loaded from the DB", so @PreUpdate can compare against
    // it and detect "someone is trying to modify an already-LOCKED row."
    @Transient
    private ConsultationStatus originalStatusAtLoad;
}