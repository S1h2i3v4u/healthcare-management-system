package com.healthcareapp.document;

import com.healthcareapp.appointment.Appointment;
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

// Represents one uploaded file (lab report, scan, prescription image, etc.
// — §23) tied to a specific appointment. The actual file bytes live on
// disk (see StorageService, next); this row stores metadata + the path
// needed to retrieve it, and — critically — is the thing access-control
// checks run against BEFORE any file bytes are ever served (§41).
@Entity
@Table(name = "medical_documents")
@EntityListeners({AuditingEntityListener.class, MedicalDocumentLockListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "uploaded_by_user_id", nullable = false)
    private User uploadedBy; // always a DoctorProfile's User per §23/§41 — patients never upload

    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    // Server-side storage path — NEVER exposed directly to the client as a
    // downloadable URL (§41: "Do not expose uploaded medical files through
    // publicly guessable URLs"). The controller resolves this internally
    // after an authorization check; the client only ever sees a document
    // ID and calls an authenticated download endpoint.
    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "content_type", nullable = false)
    private String contentType; // e.g. "application/pdf", "image/jpeg"

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @CreatedDate
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    public enum DocumentType {
        BLOOD_TEST, URINE_TEST, X_RAY, MRI, CT_SCAN, PRESCRIPTION, OTHER
    }
}