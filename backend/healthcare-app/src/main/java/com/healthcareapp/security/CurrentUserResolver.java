package com.healthcareapp.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.healthcareapp.auth.enums.Role;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CurrentUserResolver {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public boolean isCurrentUserPatient() {
        return getCurrentUser().getRole() == Role.PATIENT;
    }

    public boolean isCurrentUserAdmin() {
        return getCurrentUser().getRole() == Role.ADMIN;
    }
}