package com.healthcareapp.doctor.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Deliberately scoped like UpdatePatientProfileRequest was — no
// verificationStatus, no medicalRegistrationNumber (changing your own
// license number should not be a self-service edit; that would let a
// doctor silently swap in a different number post-verification, defeating
// the whole verification process). Only genuinely safe-to-self-edit
// professional details are here.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDoctorProfileRequest {
    private String medicalQualification;
    private String specialization;
    private Integer yearsOfExperience;
    private BigDecimal consultationFee;
    private String city;
    private String address;
    private String profilePhotoUrl;
    private String professionalBio;
}