package com.healthcareapp.consultation.dto;

import com.healthcareapp.consultation.Consultation;
import com.healthcareapp.consultation.ConsultationStatus;
import com.healthcareapp.consultation.Vitals;
import com.healthcareapp.diagnosis.Diagnosis;
import com.healthcareapp.prescription.Prescription;
import com.healthcareapp.prescription.PrescriptionItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationResponse {

    private Long id;
    private Long appointmentId;
    private ConsultationStatus status;

    private String chiefComplaint;
    private String symptoms;
    private String examinationNotes;
    private String medicalAdvice;

    private Boolean followUpRequired;
    private LocalDate followUpDate;
    private String followUpInstructions;

    private VitalsDto vitals;
    private DiagnosisDto diagnosis;
    private List<PrescriptionItemDto> prescriptionItems;

    private LocalDateTime completedAt;
    private LocalDateTime createdAt;

    public static ConsultationResponse fromEntity(
            Consultation consultation, Vitals vitals, Diagnosis diagnosis, Prescription prescription) {

        return ConsultationResponse.builder()
                .id(consultation.getId())
                .appointmentId(consultation.getAppointment().getId())
                .status(consultation.getStatus())
                .chiefComplaint(consultation.getChiefComplaint())
                .symptoms(consultation.getSymptoms())
                .examinationNotes(consultation.getExaminationNotes())
                .medicalAdvice(consultation.getMedicalAdvice())
                .followUpRequired(consultation.getFollowUpRequired())
                .followUpDate(consultation.getFollowUpDate())
                .followUpInstructions(consultation.getFollowUpInstructions())
                .vitals(vitals == null ? null : VitalsDto.fromEntity(vitals))
                .diagnosis(diagnosis == null ? null : DiagnosisDto.fromEntity(diagnosis))
                .prescriptionItems(prescription == null ? List.of() :
                        prescription.getItems().stream()
                                .map(PrescriptionItemDto::fromEntity)
                                .collect(Collectors.toList()))
                .completedAt(consultation.getCompletedAt())
                .createdAt(consultation.getCreatedAt())
                .build();
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VitalsDto {
        private String bloodPressure;
        private Integer heartRate;
        private java.math.BigDecimal temperature;
        private Integer respiratoryRate;
        private Integer oxygenSaturation;
        private java.math.BigDecimal heightCm;
        private java.math.BigDecimal weightKg;

        public static VitalsDto fromEntity(Vitals v) {
            return VitalsDto.builder()
                    .bloodPressure(v.getBloodPressure())
                    .heartRate(v.getHeartRate())
                    .temperature(v.getTemperature())
                    .respiratoryRate(v.getRespiratoryRate())
                    .oxygenSaturation(v.getOxygenSaturation())
                    .heightCm(v.getHeightCm())
                    .weightKg(v.getWeightKg())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DiagnosisDto {
        private String diagnosisName;
        private String diagnosisDescription;
        private String icdCode;

        public static DiagnosisDto fromEntity(Diagnosis d) {
            return DiagnosisDto.builder()
                    .diagnosisName(d.getDiagnosisName())
                    .diagnosisDescription(d.getDiagnosisDescription())
                    .icdCode(d.getIcdCode())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PrescriptionItemDto {
        private String medicineName;
        private String dosage;
        private String frequency;
        private String route;
        private String duration;
        private Integer quantity;
        private String instructions;

        public static PrescriptionItemDto fromEntity(PrescriptionItem item) {
            return PrescriptionItemDto.builder()
                    .medicineName(item.getMedicineName())
                    .dosage(item.getDosage())
                    .frequency(item.getFrequency())
                    .route(item.getRoute())
                    .duration(item.getDuration())
                    .quantity(item.getQuantity())
                    .instructions(item.getInstructions())
                    .build();
        }
    }
}