package com.healthcareapp.amendment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcareapp.amendment.dto.AmendmentResponse;
import com.healthcareapp.amendment.dto.ReviewAmendmentRequest;
import com.healthcareapp.amendment.dto.SubmitAmendmentRequest;
import com.healthcareapp.audit.AuditService;
import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.consultation.Consultation;
import com.healthcareapp.consultation.ConsultationRepository;
import com.healthcareapp.consultation.ConsultationStatus;
import com.healthcareapp.notification.Notification;
import com.healthcareapp.notification.NotificationService;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AmendmentService {

    private final AmendmentRepository amendmentRepository;
    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;


    // ============================================================
    // SUBMIT AMENDMENT — DOCTOR
    // ============================================================

    @Transactional
    public AmendmentResponse submitAmendment(
            Long consultationId,
            Long requestedByUserId,
            SubmitAmendmentRequest request) {

        // --------------------------------------------------------
        // 1. Find consultation
        // --------------------------------------------------------

        Consultation consultation =
                consultationRepository.findById(consultationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Consultation not found"
                                )
                        );

        // --------------------------------------------------------
        // 2. Only locked consultations can be amended
        // --------------------------------------------------------

        if (consultation.getStatus()
                != ConsultationStatus.LOCKED) {

            throw new ConflictException(
                    "Only locked consultations can have amendments filed against them. "
                            + "This consultation is still a draft — edit it directly instead."
            );
        }

        // --------------------------------------------------------
        // 3. Find requesting user
        // --------------------------------------------------------

        User requestedBy =
                userRepository.findById(requestedByUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        // --------------------------------------------------------
        // 4. Create amendment
        // --------------------------------------------------------

        MedicalRecordAmendment amendment =
                MedicalRecordAmendment.builder()
                        .originalConsultation(consultation)
                        .requestedBy(requestedBy)
                        .reason(request.getReason())
                        .proposedCorrection(
                                request.getProposedCorrection()
                        )
                        .status(AmendmentStatus.PENDING)
                        .build();

        // --------------------------------------------------------
        // 5. Save amendment
        // --------------------------------------------------------

        MedicalRecordAmendment saved =
                amendmentRepository.save(amendment);

        // --------------------------------------------------------
        // 6. Audit log
        // --------------------------------------------------------

        auditService.writeAuditLog(
                requestedByUserId,
                "DOCTOR",
                "AMENDMENT_SUBMITTED",
                "MedicalRecordAmendment",
                saved.getId(),
                request.getReason()
        );

        // --------------------------------------------------------
        // 7. Return response
        // --------------------------------------------------------

        return AmendmentResponse.fromEntity(saved);
    }


    // ============================================================
    // REVIEW AMENDMENT — ADMIN
    // ============================================================

    @Transactional
    public AmendmentResponse reviewAmendment(
            Long amendmentId,
            Long reviewerUserId,
            ReviewAmendmentRequest request) {

        // --------------------------------------------------------
        // 1. Find amendment
        // --------------------------------------------------------

        MedicalRecordAmendment amendment =
                amendmentRepository.findById(amendmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Amendment not found"
                                )
                        );

        // --------------------------------------------------------
        // 2. Prevent duplicate review
        // --------------------------------------------------------

        if (amendment.getStatus()
                != AmendmentStatus.PENDING) {

            throw new ConflictException(
                    "This amendment has already been reviewed ("
                            + amendment.getStatus()
                            + ") and cannot be reviewed again."
            );
        }

        // --------------------------------------------------------
        // 3. Find admin reviewer
        // --------------------------------------------------------

        User reviewer =
                userRepository.findById(reviewerUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Reviewer not found"
                                )
                        );

        // --------------------------------------------------------
        // 4. Update status
        // --------------------------------------------------------

        amendment.setStatus(
                request.isApproved()
                        ? AmendmentStatus.APPROVED
                        : AmendmentStatus.REJECTED
        );

        amendment.setApprovedBy(reviewer);

        amendment.setReviewedAt(
                LocalDateTime.now()
        );

        amendment.setReviewNotes(
                request.getReviewNotes()
        );

        // --------------------------------------------------------
        // 5. Save amendment
        // --------------------------------------------------------

        MedicalRecordAmendment saved =
                amendmentRepository.save(amendment);

        // --------------------------------------------------------
        // 6. Audit log
        // --------------------------------------------------------

        String auditAction =
                request.isApproved()
                        ? "AMENDMENT_APPROVED"
                        : "AMENDMENT_REJECTED";

        auditService.writeAuditLog(
                reviewerUserId,
                "ADMIN",
                auditAction,
                "MedicalRecordAmendment",
                saved.getId(),
                request.getReviewNotes()
        );

        // --------------------------------------------------------
        // 7. Notify requester
        // --------------------------------------------------------

        notificationService.createNotification(
                amendment
                        .getRequestedBy()
                        .getId(),

                "Correction Request "
                        + (request.isApproved()
                        ? "Approved"
                        : "Rejected"),

                request.getReviewNotes() != null
                        ? request.getReviewNotes()
                        : "Your amendment request has been reviewed.",

                Notification.NotificationType.AMENDMENT_REVIEWED
        );

        // --------------------------------------------------------
        // 8. Return response
        // --------------------------------------------------------

        return AmendmentResponse.fromEntity(saved);
    }


    // ============================================================
    // GET AMENDMENTS FOR CONSULTATION
    // ============================================================

    public List<AmendmentResponse> getAmendmentsForConsultation(
            Long consultationId) {

        return amendmentRepository
                .findByOriginalConsultationIdOrderByCreatedAtDesc(
                        consultationId
                )
                .stream()
                .map(AmendmentResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET PENDING AMENDMENTS — ADMIN
    // ============================================================

    public List<AmendmentResponse> getPendingAmendments() {

        return amendmentRepository
                .findByStatusOrderByCreatedAtAsc(
                        AmendmentStatus.PENDING
                )
                .stream()
                .map(AmendmentResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET MY SUBMITTED AMENDMENTS
    // ============================================================

    public List<AmendmentResponse> getMySubmittedAmendments(
            Long requestedByUserId) {

        return amendmentRepository
                .findByRequestedByIdOrderByCreatedAtDesc(
                        requestedByUserId
                )
                .stream()
                .map(AmendmentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}