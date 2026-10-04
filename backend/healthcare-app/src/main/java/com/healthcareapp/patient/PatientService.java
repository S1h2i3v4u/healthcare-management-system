package com.healthcareapp.patient;

import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.patient.dto.PatientProfileResponse;
import com.healthcareapp.patient.dto.UpdatePatientProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientProfileRepository patientProfileRepository;

    public PatientProfileResponse getMyProfile(Long userId) {
        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return PatientProfileResponse.fromEntity(profile);
    }

    @Transactional
    public PatientProfileResponse updateMyProfile(Long userId, UpdatePatientProfileRequest request) {

        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getGender() != null) {
            try {
                profile.setGender(PatientProfile.Gender.valueOf(request.getGender().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ConflictException("Gender must be one of MALE, FEMALE, OTHER");
            }
        }

        // Optional fields — simply overwritten with whatever was sent,
        // including null (clearing a previously-set value is valid, e.g.
        // removing an emergency contact).
        profile.setBloodGroup(request.getBloodGroup());
        profile.setEmergencyContactName(request.getEmergencyContactName());
        profile.setEmergencyContactRelationship(request.getEmergencyContactRelationship());
        profile.setEmergencyContactMobile(request.getEmergencyContactMobile());
        profile.setAddress(request.getAddress());

        PatientProfile updated = patientProfileRepository.save(profile);
        return PatientProfileResponse.fromEntity(updated);
    }
}