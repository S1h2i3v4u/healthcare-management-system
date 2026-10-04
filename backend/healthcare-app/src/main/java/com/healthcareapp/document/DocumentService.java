package com.healthcareapp.document;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.healthcareapp.appointment.Appointment;
import com.healthcareapp.appointment.AppointmentRepository;
import com.healthcareapp.audit.AuditService;
import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.consultation.ConsultationStatus;
import com.healthcareapp.document.dto.DocumentResponse;
import com.healthcareapp.notification.Notification;
import com.healthcareapp.notification.NotificationService;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final AuditService auditService;
    private final NotificationService notificationService;


    // ============================================================
    // UPLOAD DOCUMENT — DOCTOR ONLY
    // ============================================================

    @Transactional
    public DocumentResponse uploadDocument(
            Long appointmentId,
            Long doctorUserId,
            MultipartFile file,
            MedicalDocument.DocumentType documentType) {

        // --------------------------------------------------------
        // 1. Find appointment
        // --------------------------------------------------------

        Appointment appointment =
                appointmentRepository.findById(appointmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                )
                        );

        // --------------------------------------------------------
        // 2. Verify doctor owns appointment
        // --------------------------------------------------------

        if (!appointment.getDoctorProfile()
                .getUser()
                .getId()
                .equals(doctorUserId)) {

            throw new ResourceNotFoundException(
                    "Appointment not found"
            );
        }

        // --------------------------------------------------------
        // 3. Prevent upload after consultation is locked
        // --------------------------------------------------------

        if (appointment.getConsultation() != null
                && appointment.getConsultation().getStatus()
                == ConsultationStatus.LOCKED) {

            throw new ConflictException(
                    "This consultation is locked — new documents cannot be added."
            );
        }

        // --------------------------------------------------------
        // 4. Find doctor user
        // --------------------------------------------------------

        User doctor =
                userRepository.findById(doctorUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        // --------------------------------------------------------
        // 5. Store physical file
        // --------------------------------------------------------

        StorageService.StoredFile stored =
                storageService.store(file);

        // --------------------------------------------------------
        // 6. Create document entity
        // --------------------------------------------------------

        MedicalDocument document =
                MedicalDocument.builder()
                        .appointment(appointment)
                        .uploadedBy(doctor)
                        .documentName(
                                stored.getOriginalFilename()
                        )
                        .documentType(
                                documentType
                        )
                        .storagePath(
                                stored.getStoragePath()
                        )
                        .originalFilename(
                                stored.getOriginalFilename()
                        )
                        .contentType(
                                stored.getContentType()
                        )
                        .fileSizeBytes(
                                stored.getFileSizeBytes()
                        )
                        .build();

        // --------------------------------------------------------
        // 7. Save document
        // --------------------------------------------------------

        MedicalDocument saved =
                documentRepository.save(document);

        // --------------------------------------------------------
        // 8. Audit log
        // --------------------------------------------------------

        auditService.writeAuditLog(
                doctorUserId,
                "DOCTOR",
                "FILE_UPLOADED",
                "MedicalDocument",
                saved.getId(),
                stored.getOriginalFilename()
        );

        // --------------------------------------------------------
        // 9. Notify patient
        // --------------------------------------------------------

        notificationService.createNotification(
                appointment
                        .getPatientProfile()
                        .getUser()
                        .getId(),

                "New Medical Report Available",

                stored.getOriginalFilename()
                        + " has been added to your medical records.",

                Notification.NotificationType.NEW_MEDICAL_REPORT
        );

        // --------------------------------------------------------
        // 10. Return response
        // --------------------------------------------------------

        return DocumentResponse.fromEntity(saved);
    }


    // ============================================================
    // PATIENT — MY DOCUMENTS
    // ============================================================

    public List<DocumentResponse> getMyDocuments(
            Long patientProfileId) {

        return documentRepository
                .findByAppointmentPatientProfileIdOrderByUploadedAtDesc(
                        patientProfileId
                )
                .stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // ============================================================
    // DOCUMENTS FOR APPOINTMENT
    // ============================================================

    public List<DocumentResponse> getDocumentsForAppointment(
            Long appointmentId) {

        return documentRepository
                .findByAppointmentIdOrderByUploadedAtDesc(
                        appointmentId
                )
                .stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // ============================================================
    // DOWNLOAD DOCUMENT
    // ============================================================

    public DownloadableFile getDownloadableFile(
            Long documentId) {

        MedicalDocument document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found"
                                )
                        );

        InputStream fileStream =
                storageService.retrieve(
                        document.getStoragePath()
                );

        return DownloadableFile.builder()
                .inputStream(fileStream)
                .filename(
                        document.getOriginalFilename()
                )
                .contentType(
                        document.getContentType()
                )
                .build();
    }


    // ============================================================
    // DOWNLOADABLE FILE
    // ============================================================

    @lombok.Builder
    @lombok.Getter
    public static class DownloadableFile {

        private final InputStream inputStream;

        private final String filename;

        private final String contentType;
    }
}