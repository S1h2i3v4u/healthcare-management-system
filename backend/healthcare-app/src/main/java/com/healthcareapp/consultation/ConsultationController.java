package com.healthcareapp.consultation;

import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.consultation.dto.CompleteConsultationRequest;
import com.healthcareapp.consultation.dto.ConsultationDraftRequest;
import com.healthcareapp.consultation.dto.ConsultationResponse;
import com.healthcareapp.security.CurrentUserResolver;
import com.healthcareapp.security.OwnershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments/{appointmentId}")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;
    private final CurrentUserResolver currentUserResolver;
    private final OwnershipService ownershipService;

    @PutMapping("/consultation/draft")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<ConsultationResponse>> saveDraft(
            @PathVariable Long appointmentId,
            @Valid @RequestBody ConsultationDraftRequest request) {

        Long doctorUserId = currentUserResolver.getCurrentUserId();
        ConsultationResponse response = consultationService.saveDraft(appointmentId, doctorUserId, request);

        return ResponseEntity.ok(ApiResponse.success("Draft saved", response));
    }

    @PostMapping("/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<ConsultationResponse>> completeConsultation(
            @PathVariable Long appointmentId,
            @Valid @RequestBody CompleteConsultationRequest request) {

        Long doctorUserId = currentUserResolver.getCurrentUserId();
        ConsultationResponse response = consultationService.completeConsultation(appointmentId, doctorUserId, request);

        return ResponseEntity.ok(ApiResponse.success(
                "Appointment completed successfully. Medical record has been permanently locked.",
                response));
    }

    @GetMapping("/consultation")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<ApiResponse<ConsultationResponse>> getConsultation(@PathVariable Long appointmentId) {

        // Shared ownership check — same helper now used by Appointment,
        // Consultation, and Amendment controllers, so this class of gap
        // (role check with no ownership check underneath) is enforced from
        // one place instead of re-implemented per controller.
        ownershipService.verifyCurrentUserOwnsAppointment(appointmentId);

        ConsultationResponse response = consultationService.getConsultationByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Consultation fetched", response));
    }
}