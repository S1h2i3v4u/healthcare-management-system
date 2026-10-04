package com.healthcareapp.prescription;

import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.prescription.dto.PrescriptionListResponse;
import com.healthcareapp.security.CurrentUserResolver;
import com.healthcareapp.security.OwnershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PrescriptionPdfService prescriptionPdfService;
    private final CurrentUserResolver currentUserResolver;
    private final OwnershipService ownershipService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<PrescriptionListResponse>>> getMyPrescriptions() {

        Long userId = currentUserResolver.getCurrentUserId();
        List<PrescriptionListResponse> response = prescriptionService.getMyPrescriptions(userId);

        return ResponseEntity.ok(ApiResponse.success("Prescriptions fetched", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<ApiResponse<PrescriptionListResponse>> getPrescriptionById(@PathVariable Long id) {

        ownershipService.verifyCurrentUserOwnsPrescription(id);
        PrescriptionListResponse response = prescriptionService.getPrescriptionById(id);

        return ResponseEntity.ok(ApiResponse.success("Prescription fetched", response));
    }

    // ===== PDF download (§22) — same ownership check as the JSON detail
    // view, since it's the same underlying data, just rendered differently. =====
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(@PathVariable Long id) {

        ownershipService.verifyCurrentUserOwnsPrescription(id);

        byte[] pdfBytes = prescriptionPdfService.generatePrescriptionPdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename("prescription-" + id + ".pdf").build().toString())
                .body(pdfBytes);
    }
}