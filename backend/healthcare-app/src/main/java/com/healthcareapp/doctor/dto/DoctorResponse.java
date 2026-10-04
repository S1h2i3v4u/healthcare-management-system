package com.healthcareapp.doctor.dto;

import java.math.BigDecimal;
import java.util.List;

import com.healthcareapp.doctor.DoctorProfile;
import com.healthcareapp.doctor.VerificationStatus;

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
public class DoctorResponse {

    private Long id;

    private String fullName;

    private String profilePhotoUrl;

    private VerificationStatus verificationStatus;

    private String medicalQualification;

    private String specialization;

    private Integer yearsOfExperience;

    private BigDecimal consultationFee;

    private String city;

    // Doctor's address
    private String address;

    private String professionalBio;

    private List<String> hospitalNames;

    private List<Long> hospitalIds;

    // ============================================================
    // SAVED DOCTOR
    // ============================================================

    /**
     * Whether this doctor is saved by the currently logged-in
     * patient.
     *
     * This is viewer-specific, so it is NOT populated inside
     * fromEntity().
     */
    private Boolean isSaved;


    // ============================================================
    // ENTITY -> RESPONSE
    // ============================================================

    public static DoctorResponse fromEntity(
            DoctorProfile doctor,
            List<String> hospitalNames,
            List<Long> hospitalIds) {

        return DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getUser().getFullName())
                .profilePhotoUrl(doctor.getProfilePhotoUrl())
                .verificationStatus(doctor.getVerificationStatus())
                .medicalQualification(doctor.getMedicalQualification())
                .specialization(doctor.getSpecialization())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .consultationFee(doctor.getConsultationFee())
                .city(doctor.getCity())
                .address(doctor.getAddress())
                .professionalBio(doctor.getProfessionalBio())
                .hospitalNames(hospitalNames)
                .hospitalIds(hospitalIds)
                .build();
    }


    // ============================================================
    // SAVED FLAG HELPER
    // ============================================================

    public static DoctorResponse withSavedFlag(
            DoctorResponse response,
            boolean isSaved) {

        response.setIsSaved(isSaved);

        return response;
    }
}