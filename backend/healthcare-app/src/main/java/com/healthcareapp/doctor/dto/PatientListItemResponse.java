package com.healthcareapp.doctor.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientListItemResponse {
    private Long patientProfileId;
    private String fullName;
    private Integer age; // derived from dateOfBirth, not stored directly
    private String gender;
    private LocalDate lastAppointmentDate;
    private LocalDate nextAppointmentDate; // null if none upcoming
}