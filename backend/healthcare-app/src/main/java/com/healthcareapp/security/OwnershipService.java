package com.healthcareapp.security;

import com.healthcareapp.appointment.AppointmentRepository;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.consultation.Consultation;
import com.healthcareapp.consultation.ConsultationRepository;
import com.healthcareapp.doctor.DoctorProfileRepository;
import com.healthcareapp.document.DocumentRepository;
import com.healthcareapp.document.MedicalDocument;
import com.healthcareapp.patient.PatientProfileRepository;
import com.healthcareapp.prescription.Prescription;
import com.healthcareapp.prescription.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OwnershipService {

    private final CurrentUserResolver currentUserResolver;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DocumentRepository documentRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    public void verifyCurrentUserOwnsAppointment(Long appointmentId) {

        Long userId = currentUserResolver.getCurrentUserId();
        boolean isPatient = currentUserResolver.isCurrentUserPatient();

        boolean owns;
        if (isPatient) {
            Long patientProfileId = patientProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"))
                    .getId();
            owns = appointmentRepository.existsByIdAndPatientProfileId(appointmentId, patientProfileId);
        } else {
            Long doctorProfileId = doctorProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"))
                    .getId();
            owns = appointmentRepository.existsByIdAndDoctorProfileId(appointmentId, doctorProfileId);
        }

        if (!owns) {
            throw new ResourceNotFoundException("Appointment not found");
        }
    }

    public void verifyCurrentUserOwnsConsultation(Long consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));
        verifyCurrentUserOwnsAppointment(consultation.getAppointment().getId());
    }

    public void verifyCurrentUserOwnsPrescription(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
        verifyCurrentUserOwnsAppointment(prescription.getConsultation().getAppointment().getId());
    }

    // Fifth resource type delegating to the same root check — a document
    // is owned by whoever owns its appointment, exactly like everything else.
    public void verifyCurrentUserOwnsDocument(Long documentId) {
        MedicalDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        verifyCurrentUserOwnsAppointment(document.getAppointment().getId());
    }
}