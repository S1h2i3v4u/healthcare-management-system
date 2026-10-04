package com.healthcareapp.amendment;

import com.healthcareapp.amendment.dto.AmendmentResponse;
import com.healthcareapp.amendment.dto.ReviewAmendmentRequest;
import com.healthcareapp.amendment.dto.SubmitAmendmentRequest;
import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.security.CurrentUserResolver;
import com.healthcareapp.security.OwnershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AmendmentController {

    private final AmendmentService amendmentService;
    private final CurrentUserResolver currentUserResolver;
    private final OwnershipService ownershipService;

    @PostMapping("/api/consultations/{consultationId}/amendments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AmendmentResponse>> submitAmendment(
            @PathVariable Long consultationId,
            @Valid @RequestBody SubmitAmendmentRequest request) {

        Long requestedByUserId = currentUserResolver.getCurrentUserId();
        AmendmentResponse response = amendmentService.submitAmendment(consultationId, requestedByUserId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Correction request submitted for review", response));
    }

    @GetMapping("/api/consultations/{consultationId}/amendments")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AmendmentResponse>>> getAmendmentsForConsultation(
            @PathVariable Long consultationId) {

        // ADMIN bypasses ownership — admins review amendments regardless of
        // whose record it is. PATIENT/DOCTOR must own the underlying
        // appointment, checked via the shared OwnershipService.
        if (!currentUserResolver.isCurrentUserAdmin()) {
            ownershipService.verifyCurrentUserOwnsConsultation(consultationId);
        }

        List<AmendmentResponse> response = amendmentService.getAmendmentsForConsultation(consultationId);
        return ResponseEntity.ok(ApiResponse.success("Amendments fetched", response));
    }

    @GetMapping("/api/amendments/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<AmendmentResponse>>> getMyAmendments() {

        Long userId = currentUserResolver.getCurrentUserId();
        List<AmendmentResponse> response = amendmentService.getMySubmittedAmendments(userId);

        return ResponseEntity.ok(ApiResponse.success("Your amendments fetched", response));
    }

    @GetMapping("/api/admin/amendments/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AmendmentResponse>>> getPendingAmendments() {

        List<AmendmentResponse> response = amendmentService.getPendingAmendments();
        return ResponseEntity.ok(ApiResponse.success("Pending amendments fetched", response));
    }

    @PutMapping("/api/admin/amendments/{amendmentId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AmendmentResponse>> reviewAmendment(
            @PathVariable Long amendmentId,
            @Valid @RequestBody ReviewAmendmentRequest request) {

        Long reviewerUserId = currentUserResolver.getCurrentUserId();
        AmendmentResponse response = amendmentService.reviewAmendment(amendmentId, reviewerUserId, request);

        return ResponseEntity.ok(ApiResponse.success("Amendment reviewed", response));
    }
}