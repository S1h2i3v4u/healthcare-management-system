package com.healthcareapp.admin.dto;

import java.time.LocalDateTime;

import com.healthcareapp.user.User;

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
public class AdminPatientListResponse {
    private Long id;
    private String fullName;
    private String email;
    private String mobileNumber;
    private boolean active;
    private LocalDateTime createdAt;

    public static AdminPatientListResponse fromEntity(User u) {
        return AdminPatientListResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .mobileNumber(u.getMobileNumber())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}