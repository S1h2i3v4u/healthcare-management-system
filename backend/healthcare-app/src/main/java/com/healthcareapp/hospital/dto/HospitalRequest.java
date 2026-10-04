package com.healthcareapp.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HospitalRequest {

    @NotBlank(message = "Hospital name is required")
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    private String pincode;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String email;

    private String website;

    // Comma-separated, e.g. "Cardiology,Orthopedics,Pediatrics" — matches the
    // flat storage approach used in Hospital.java for now.
    private String specialties;

    private String imageUrl;
}