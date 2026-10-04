package com.healthcareapp.amendment;

import com.healthcareapp.consultation.Consultation;
import com.healthcareapp.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// Per §19/§57: the ORIGINAL Consultation record is NEVER modified once
// LOCKED. This entity is the only sanctioned way to record a correction —
// it points AT the original record but lives entirely separately, so the
// original stays permanently intact and queryable exactly as it was
// finalized, no matter how many amendments get attached to it later.
@Entity
@Table(name = "medical_record_amendments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordAmendment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Deliberately NOT unique — a single locked consultation could
    // reasonably receive more than one amendment over time (e.g. two
    // separate errors discovered on two separate occasions).
    @ManyToOne
    @JoinColumn(name = "original_consultation_id", nullable = false)
    private Consultation originalConsultation;

    @ManyToOne
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "proposed_correction", nullable = false, columnDefinition = "TEXT")
    private String proposedCorrection;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AmendmentStatus status = AmendmentStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy; // null until an admin/reviewer acts on it

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes; // optional — reviewer's reasoning, especially useful on rejection

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}