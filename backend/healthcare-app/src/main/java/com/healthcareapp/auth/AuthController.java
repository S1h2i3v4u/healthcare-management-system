package com.healthcareapp.auth;

import com.healthcareapp.auth.dto.AuthResponse;
import com.healthcareapp.auth.dto.LoginRequest;
import com.healthcareapp.auth.dto.RegisterDoctorRequest;
import com.healthcareapp.auth.dto.RegisterPatientRequest;
import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register/patient")
    public ResponseEntity<ApiResponse<AuthResponse>> registerPatient(
            @Valid @RequestBody RegisterPatientRequest request) {

        AuthResponse response = authService.registerPatient(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered successfully", response));
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<ApiResponse<AuthResponse>> registerDoctor(
            @Valid @RequestBody RegisterDoctorRequest request) {

        AuthResponse response = authService.registerDoctor(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Doctor registered successfully. Your account is pending verification by an admin.",
                        response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("fullName", user.getFullName());
        userInfo.put("email", user.getEmail());
        userInfo.put("mobileNumber", user.getMobileNumber());
        userInfo.put("role", user.getRole());
        userInfo.put("active", user.isActive());

        return ResponseEntity.ok(
                ApiResponse.success("Current user fetched", userInfo));
    }
}