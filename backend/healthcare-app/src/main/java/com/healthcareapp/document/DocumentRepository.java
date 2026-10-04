package com.healthcareapp.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<MedicalDocument, Long> {

    // §23's "My Reports" list — every document across all of this patient's
    // appointments. Walks Document -> Appointment -> PatientProfile, same
    // multi-hop JPQL pattern used by PrescriptionRepository.findAllForPatient.
    List<MedicalDocument> findByAppointmentPatientProfileIdOrderByUploadedAtDesc(Long patientProfileId);

    // Documents for one specific appointment — used when a doctor views
    // "attachments for this consultation" (§16.I) or a patient views
    // documents tied to one particular visit.
    List<MedicalDocument> findByAppointmentIdOrderByUploadedAtDesc(Long appointmentId);

    Optional<MedicalDocument> findByIdAndAppointmentId(Long documentId, Long appointmentId);
}