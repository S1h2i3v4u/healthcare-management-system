package com.healthcareapp.prescription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

// §22's "My Prescriptions" list — one row per prescription, with enough
// detail to display without a second call. The medicine-level detail
// (dosage, frequency, duration, instructions) IS included here, unlike
// MedicalHistoryEntryResponse's deliberately-thin summary — §22 shows the
// prescription list itself displaying dosage/frequency/duration directly,
// not just a count.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionListResponse {

    private Long prescriptionId;
    private Long consultationId;
    private Long appointmentId;
    private LocalDate prescriptionDate; // the appointment date it was written on
    private String doctorName;
    private String medicalRegistrationNumber; // required on the PDF per §22
    private String hospitalName;
    private String diagnosisName;
    private List<MedicineItem> medicines;
    private String followUpInstructions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MedicineItem {
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}