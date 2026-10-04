package com.healthcareapp.amendment.dto;

import com.healthcareapp.amendment.AmendmentStatus;
import com.healthcareapp.amendment.MedicalRecordAmendment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmendmentResponse {

    private Long id;
    private Long originalConsultationId;
    private String requestedByName;
    private String reason;
    private String proposedCorrection;
    private AmendmentStatus status;
    private String approvedByName;
    private LocalDateTime reviewedAt;
    private String reviewNotes;
    private LocalDateTime createdAt;

    public static AmendmentResponse fromEntity(MedicalRecordAmendment amendment) {
        return AmendmentResponse.builder()
                .id(amendment.getId())
                .originalConsultationId(amendment.getOriginalConsultation().getId())
                .requestedByName(amendment.getRequestedBy().getFullName())
                .reason(amendment.getReason())
                .proposedCorrection(amendment.getProposedCorrection())
                .status(amendment.getStatus())
                .approvedByName(amendment.getApprovedBy() == null ? null : amendment.getApprovedBy().getFullName())
                .reviewedAt(amendment.getReviewedAt())
                .reviewNotes(amendment.getReviewNotes())
                .createdAt(amendment.getCreatedAt())
                .build();
    }
}