package com.healthcareapp.hospital.dto;

import com.healthcareapp.hospital.Hospital;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String email;
    private String website;
    private String specialties;
    private String imageUrl;
    private Hospital.HospitalStatus status;
    private LocalDateTime createdAt;

    // Maps a Hospital entity to its response DTO — keeps this conversion
    // logic in one place rather than repeating field-by-field mapping
    // across the service every time a Hospital needs to go out over the API.
    public static HospitalResponse fromEntity(Hospital hospital) {
        return HospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .description(hospital.getDescription())
                .address(hospital.getAddress())
                .city(hospital.getCity())
                .state(hospital.getState())
                .pincode(hospital.getPincode())
                .phone(hospital.getPhone())
                .email(hospital.getEmail())
                .website(hospital.getWebsite())
                .specialties(hospital.getSpecialties())
                .imageUrl(hospital.getImageUrl())
                .status(hospital.getStatus())
                .createdAt(hospital.getCreatedAt())
                .build();
    }
}