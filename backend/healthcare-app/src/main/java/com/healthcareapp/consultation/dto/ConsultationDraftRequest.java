package com.healthcareapp.consultation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

// Used by "Save Draft" (§17) — every field is optional here, since a doctor
// may save partial progress at any point during an active consultation.
// This is deliberately more permissive than CompleteConsultationRequest,
// which requires the fields that actually matter for a finalized record.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDraftRequest {

    private String chiefComplaint;
    private String symptoms;
    private String examinationNotes;
    private String medicalAdvice;

    private Boolean followUpRequired;
    private LocalDate followUpDate;
    private String followUpInstructions;

    @Valid
    private VitalsInput vitals;

    @Valid
    private DiagnosisInput diagnosis;

    @Valid
    private List<PrescriptionItemInput> prescriptionItems;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VitalsInput {
        private String bloodPressure;

        @Min(value = 20, message = "Heart rate seems too low to be valid")
        @Max(value = 250, message = "Heart rate seems too high to be valid")
        private Integer heartRate;

        private java.math.BigDecimal temperature;

        @Min(value = 5, message = "Respiratory rate seems too low to be valid")
        @Max(value = 80, message = "Respiratory rate seems too high to be valid")
        private Integer respiratoryRate;

        @Min(value = 0, message = "Oxygen saturation cannot be negative")
        @Max(value = 100, message = "Oxygen saturation cannot exceed 100%")
        private Integer oxygenSaturation;

        private java.math.BigDecimal heightCm;
        private java.math.BigDecimal weightKg;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiagnosisInput {
        private String diagnosisName;
        private String diagnosisDescription;
        private String icdCode;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionItemInput {
        private String medicineName;
        private String dosage;
        private String frequency;
        private String route;
        private String duration;
        private Integer quantity;
        private String instructions;
    }
}