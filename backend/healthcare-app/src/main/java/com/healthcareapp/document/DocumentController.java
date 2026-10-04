package com.healthcareapp.document;

import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.document.dto.DocumentResponse;
import com.healthcareapp.patient.PatientProfileRepository;
import com.healthcareapp.security.CurrentUserResolver;
import com.healthcareapp.security.OwnershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final CurrentUserResolver currentUserResolver;
    private final OwnershipService ownershipService;
    private final PatientProfileRepository patientProfileRepository;

    // ===== Upload — doctor only (§23/§41) =====
    @PostMapping(value = "/api/appointments/{appointmentId}/documents", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @PathVariable Long appointmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") MedicalDocument.DocumentType documentType) {

        Long doctorUserId = currentUserResolver.getCurrentUserId();
        DocumentResponse response = documentService.uploadDocument(appointmentId, doctorUserId, file, documentType);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded successfully", response));
    }

    // ===== Documents for one appointment — ownership enforced via the
    // shared OwnershipService, same as Consultation/Amendment/Prescription. =====
    @GetMapping("/api/appointments/{appointmentId}/documents")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocumentsForAppointment(
            @PathVariable Long appointmentId) {

        ownershipService.verifyCurrentUserOwnsAppointment(appointmentId);
        List<DocumentResponse> response = documentService.getDocumentsForAppointment(appointmentId);

        return ResponseEntity.ok(ApiResponse.success("Documents fetched", response));
    }

    // ===== Patient's "My Reports" list (§23) — no ID in the URL, so no
    // ownership-guessing surface, same pattern as PatientController. =====
    @GetMapping("/api/documents/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getMyDocuments() {

        Long userId = currentUserResolver.getCurrentUserId();
        Long patientProfileId = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new com.healthcareapp.common.exceptions.ResourceNotFoundException("Patient profile not found"))
                .getId();

        List<DocumentResponse> response = documentService.getMyDocuments(patientProfileId);
        return ResponseEntity.ok(ApiResponse.success("Documents fetched", response));
    }

    // ===== Download — THE security-critical endpoint (§41). Ownership is
    // verified via the document's underlying appointment BEFORE any file
    // bytes are streamed back. =====
    @GetMapping("/api/documents/{documentId}/download")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<InputStreamResource> downloadDocument(@PathVariable Long documentId) {

        ownershipService.verifyCurrentUserOwnsDocument(documentId);

        DocumentService.DownloadableFile file = documentService.getDownloadableFile(documentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.getFilename()).build().toString())
                .body(new InputStreamResource(file.getInputStream()));
    }
}