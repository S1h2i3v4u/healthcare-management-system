package com.healthcareapp.amendment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmendmentRepository extends JpaRepository<MedicalRecordAmendment, Long> {

    // All amendments ever filed against a given consultation — a locked
    // record could have more than one over time (§ design note from
    // MedicalRecordAmendment.java).
    List<MedicalRecordAmendment> findByOriginalConsultationIdOrderByCreatedAtDesc(Long consultationId);

    // Admin's amendment review queue — pending ones first, oldest first
    // (fairness: don't let old requests sit unreviewed while newer ones
    // jump the queue).
    List<MedicalRecordAmendment> findByStatusOrderByCreatedAtAsc(AmendmentStatus status);

    // A doctor's own submitted amendments, e.g. for a "my correction
    // requests" view — not in the original spec pages explicitly, but a
    // reasonable small addition since a doctor submitting a request
    // presumably wants to see its status later.
    List<MedicalRecordAmendment> findByRequestedByIdOrderByCreatedAtDesc(Long requestedByUserId);
}