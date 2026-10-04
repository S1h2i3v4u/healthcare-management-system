package com.healthcareapp.consultation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

// Used by "Complete Appointment & Save Medical Record" (§18) — unlike the
// draft request, the fields that matter for a finalized medical-legal
// record are required here. This is the last chance to catch missing
// critical data BEFORE the record becomes permanently LOCKED and
// uneditable — validation here matters far more than on the draft request.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompleteConsultationRequest {

    @NotBlank(message = "Chief complaint is required to complete the consultation")
    private String chiefComplaint;

    private String symptoms;

    @NotBlank(message = "Examination notes are required to complete the consultation")
    private String examinationNotes;

    private String medicalAdvice;

    @NotNull(message = "Please specify whether follow-up is required")
    private Boolean followUpRequired;

    private LocalDate followUpDate; // required only if followUpRequired == true — checked in the service layer, not here

    private String followUpInstructions;

    @Valid
    @NotNull(message = "Vitals are required to complete the consultation")
    private ConsultationDraftRequest.VitalsInput vitals;

    @Valid
    @NotNull(message = "Diagnosis is required to complete the consultation")
    private ConsultationDraftRequest.DiagnosisInput diagnosis;

    @Valid
    @NotEmpty(message = "At least one prescription item is required to complete the consultation")
    private List<ConsultationDraftRequest.PrescriptionItemInput> prescriptionItems;
}