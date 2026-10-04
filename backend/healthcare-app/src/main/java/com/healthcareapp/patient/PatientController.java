package com.healthcareapp.patient;

import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.patient.dto.MedicalHistoryEntryResponse;
import com.healthcareapp.patient.dto.PatientProfileResponse;
import com.healthcareapp.patient.dto.UpdatePatientProfileRequest;
import com.healthcareapp.security.CurrentUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;
    private final MedicalHistoryService medicalHistoryService;
    private final CurrentUserResolver currentUserResolver;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> getMyProfile() {

        Long userId = currentUserResolver.getCurrentUserId();
        PatientProfileResponse response = patientService.getMyProfile(userId);

        return ResponseEntity.ok(ApiResponse.success("Profile fetched", response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdatePatientProfileRequest request) {

        Long userId = currentUserResolver.getCurrentUserId();
        PatientProfileResponse response = patientService.updateMyProfile(userId, request);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/me/medical-history")
    public ResponseEntity<ApiResponse<List<MedicalHistoryEntryResponse>>> getMyMedicalHistory() {

        Long userId = currentUserResolver.getCurrentUserId();
        List<MedicalHistoryEntryResponse> response = medicalHistoryService.getMedicalHistory(userId);

        return ResponseEntity.ok(ApiResponse.success("Medical history fetched", response));
    }
}