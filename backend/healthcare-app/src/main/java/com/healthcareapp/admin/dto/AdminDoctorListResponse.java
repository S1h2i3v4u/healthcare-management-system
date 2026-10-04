package com.healthcareapp.admin.dto;

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
public class AdminDoctorListResponse {

    private Long id;
    private String fullName;
    private String medicalRegistrationNumber;
    private String specialization;
    private VerificationStatus verificationStatus;
    private String city;
    private String profilePhotoUrl;

    public static AdminDoctorListResponse fromEntity(DoctorProfile d) {
        return AdminDoctorListResponse.builder()
                .id(d.getId())
                .fullName(d.getUser().getFullName())
                .medicalRegistrationNumber(
                        d.getMedicalRegistrationNumber()
                )
                .specialization(d.getSpecialization())
                .verificationStatus(d.getVerificationStatus())
                .city(d.getCity())
                .profilePhotoUrl(d.getProfilePhotoUrl())
                .build();
    }
}