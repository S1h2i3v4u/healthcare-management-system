package com.healthcareapp.patient.dto;

import com.healthcareapp.patient.PatientProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String mobileNumber;
    private LocalDate dateOfBirth;
    private PatientProfile.Gender gender;
    private String bloodGroup;
    private String emergencyContactName;
    private String emergencyContactRelationship;
    private String emergencyContactMobile;
    private String address;

    public static PatientProfileResponse fromEntity(PatientProfile profile) {
        return PatientProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .mobileNumber(profile.getUser().getMobileNumber())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .bloodGroup(profile.getBloodGroup())
                .emergencyContactName(profile.getEmergencyContactName())
                .emergencyContactRelationship(profile.getEmergencyContactRelationship())
                .emergencyContactMobile(profile.getEmergencyContactMobile())
                .address(profile.getAddress())
                .build();
    }
}