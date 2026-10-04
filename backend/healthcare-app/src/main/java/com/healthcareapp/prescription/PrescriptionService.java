package com.healthcareapp.prescription;

import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.diagnosis.Diagnosis;
import com.healthcareapp.diagnosis.DiagnosisRepository;
import com.healthcareapp.patient.PatientProfileRepository;
import com.healthcareapp.prescription.dto.PrescriptionListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PatientProfileRepository patientProfileRepository;

    // §22: "My Prescriptions" — every prescription ever written for this
    // patient, across all doctors/hospitals, most recent first.
    public List<PrescriptionListResponse> getMyPrescriptions(Long patientUserId) {

        Long patientProfileId = patientProfileRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"))
                .getId();

        List<Prescription> prescriptions = prescriptionRepository.findAllForPatient(patientProfileId);

        return prescriptions.stream()
                .map(this::toListResponse)
                .collect(Collectors.toList());
    }

    // Also used by the (upcoming) PDF generation endpoint, which needs the
    // same fully-assembled prescription data, just rendered differently —
    // this method is the single source of truth for "assemble everything
    // needed to display/print one prescription."
    public PrescriptionListResponse getPrescriptionById(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        return toListResponse(prescription);
    }

    private PrescriptionListResponse toListResponse(Prescription prescription) {

        var consultation = prescription.getConsultation();
        var appointment = consultation.getAppointment();
        var doctor = appointment.getDoctorProfile();

        Diagnosis diagnosis = diagnosisRepository.findByConsultationId(consultation.getId()).orElse(null);

        List<PrescriptionListResponse.MedicineItem> medicines = prescription.getItems().stream()
                .map(item -> PrescriptionListResponse.MedicineItem.builder()
                        .medicineName(item.getMedicineName())
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .duration(item.getDuration())
                        .instructions(item.getInstructions())
                        .build())
                .collect(Collectors.toList());

        return PrescriptionListResponse.builder()
                .prescriptionId(prescription.getId())
                .consultationId(consultation.getId())
                .appointmentId(appointment.getId())
                .prescriptionDate(appointment.getAppointmentDate())
                .doctorName(doctor.getUser().getFullName())
                .medicalRegistrationNumber(doctor.getMedicalRegistrationNumber())
                .hospitalName(appointment.getHospital().getName())
                .diagnosisName(diagnosis == null ? null : diagnosis.getDiagnosisName())
                .medicines(medicines)
                .followUpInstructions(consultation.getFollowUpInstructions())
                .build();
    }
}