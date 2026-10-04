package com.healthcareapp.document.dto;

import com.healthcareapp.document.MedicalDocument;
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
public class DocumentResponse {

    private Long id;
    private Long appointmentId;
    private String documentName;
    private MedicalDocument.DocumentType documentType;
    private String uploadedByName;
    private String originalFilename;
    private String contentType;
    private Long fileSizeBytes;
    private LocalDateTime uploadedAt;

    // Deliberately NO storagePath field — this is the actual API-level
    // enforcement of §41's "no publicly guessable URLs": the client never
    // even receives the server-side path, only this document's ID, which
    // it then uses to call the authenticated download endpoint.
    public static DocumentResponse fromEntity(MedicalDocument document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .appointmentId(document.getAppointment().getId())
                .documentName(document.getDocumentName())
                .documentType(document.getDocumentType())
                .uploadedByName(document.getUploadedBy().getFullName())
                .originalFilename(document.getOriginalFilename())
                .contentType(document.getContentType())
                .fileSizeBytes(document.getFileSizeBytes())
                .uploadedAt(document.getUploadedAt())
                .build();
    }
}