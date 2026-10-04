package com.healthcareapp.doctor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.doctor.dto.AvailabilitySlotResponse;
import com.healthcareapp.doctor.dto.CreateAvailabilityRequest;
import com.healthcareapp.doctor.dto.DoctorAvailabilityResponse;
import com.healthcareapp.doctor.dto.DoctorResponse;
import com.healthcareapp.doctor.dto.DoctorSearchFilter;
import com.healthcareapp.doctor.dto.PatientListItemResponse;
import com.healthcareapp.doctor.dto.SpecializationCountResponse;
import com.healthcareapp.doctor.dto.UpdateDoctorProfileRequest;
import com.healthcareapp.patient.MedicalHistoryService;
import com.healthcareapp.patient.dto.MedicalHistoryEntryResponse;
import com.healthcareapp.security.CurrentUserResolver;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    private final AvailabilityService availabilityService;

    private final UserRepository userRepository;

    private final DoctorProfileRepository doctorProfileRepository;

    private final MedicalHistoryService medicalHistoryService;

    private final CurrentUserResolver currentUserResolver;


    // ============================================================
    // SEARCH DOCTORS
    // ============================================================

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) String hospital,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        DoctorSearchFilter filter =
                new DoctorSearchFilter();

        filter.setName(name);
        filter.setSpecialization(specialization);
        filter.setCity(city);
        filter.setMinExperience(minExperience);
        filter.setMaxFee(maxFee);
        filter.setHospital(hospital);

        Pageable pageable =
                PageRequest.of(page, size);

        Page<DoctorResponse> doctors =
                doctorService.searchDoctors(
                        filter,
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Doctors fetched",
                        doctors
                )
        );
    }


    // ============================================================
    // DOCTOR'S OWN PROFILE
    // ============================================================

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponse>> getMyProfile() {

        Long doctorUserId =
                currentUserResolver.getCurrentUserId();

        DoctorResponse response =
                doctorService.getMyProfile(
                        doctorUserId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile fetched",
                        response
                )
        );
    }


    @PutMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateMyProfile(
            @Valid @RequestBody UpdateDoctorProfileRequest request
    ) {

        Long doctorUserId =
                currentUserResolver.getCurrentUserId();

        DoctorResponse response =
                doctorService.updateMyProfile(
                        doctorUserId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile updated successfully",
                        response
                )
        );
    }


    // ============================================================
    // SAVED DOCTORS
    // ============================================================

    @PostMapping("/{doctorProfileId}/save")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Object>> saveDoctor(
            @PathVariable Long doctorProfileId
    ) {

        Long patientUserId =
                currentUserResolver.getCurrentUserId();

        doctorService.saveDoctor(
                patientUserId,
                doctorProfileId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Doctor saved",
                        null
                )
        );
    }


    @DeleteMapping("/{doctorProfileId}/save")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Object>> unsaveDoctor(
            @PathVariable Long doctorProfileId
    ) {

        Long patientUserId =
                currentUserResolver.getCurrentUserId();

        doctorService.unsaveDoctor(
                patientUserId,
                doctorProfileId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Doctor removed from saved",
                        null
                )
        );
    }


    @GetMapping("/saved")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getSavedDoctors() {

        Long patientUserId =
                currentUserResolver.getCurrentUserId();

        List<DoctorResponse> response =
                doctorService.getSavedDoctors(
                        patientUserId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Saved doctors fetched",
                        response
                )
        );
    }


    // ============================================================
    // GET DOCTOR BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(
            @PathVariable Long id
    ) {

        DoctorResponse response =
                doctorService.getDoctorById(id);

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication != null
                && authentication.isAuthenticated()
                && currentUserResolver.isCurrentUserPatient()) {

            Long patientUserId =
                    currentUserResolver.getCurrentUserId();

            boolean saved =
                    doctorService.isDoctorSavedByPatient(
                            patientUserId,
                            id
                    );

            response =
                    DoctorResponse.withSavedFlag(
                            response,
                            saved
                    );
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Doctor fetched",
                        response
                )
        );
    }


    // ============================================================
    // GET DOCTOR AVAILABILITY
    // ============================================================

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<AvailabilitySlotResponse>>> getAvailability(
            @PathVariable Long id,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {

        List<AvailabilitySlotResponse> slots =
                availabilityService.generateSlotsForDate(
                        id,
                        date
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Availability fetched",
                        slots
                )
        );
    }


    // ============================================================
    // DOCTOR - ADD AVAILABILITY
    // ============================================================

    @PostMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorAvailabilityResponse>> addAvailability(
            @Valid @RequestBody CreateAvailabilityRequest request
    ) {

        Long doctorUserId =
                currentUserResolver.getCurrentUserId();

        DoctorAvailabilityResponse response =
                doctorService.addAvailability(
                        doctorUserId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Availability added",
                                response
                        )
                );
    }


    // ============================================================
    // DOCTOR - GET MY AVAILABILITY
    // ============================================================

    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityResponse>>> getMyAvailability() {

        Long doctorUserId =
                currentUserResolver.getCurrentUserId();

        List<DoctorAvailabilityResponse> response =
                doctorService.getMyAvailability(
                        doctorUserId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Availability fetched",
                        response
                )
        );
    }


    // ============================================================
    // DOCTOR - DELETE MY AVAILABILITY
    // ============================================================

    @DeleteMapping("/me/availability/{availabilityId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Object>> deleteAvailability(
            @PathVariable Long availabilityId
    ) {

        Long doctorUserId =
                currentUserResolver.getCurrentUserId();

        doctorService.deleteAvailability(
                availabilityId,
                doctorUserId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Availability removed",
                        null
                )
        );
    }


    // ============================================================
    // DOCTOR - LINK SELF TO HOSPITAL
    // ============================================================

    @PostMapping("/me/hospitals/{hospitalId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Object>> linkMyselfToHospital(
            @PathVariable Long hospitalId
    ) {

        Long myDoctorProfileId =
                getCurrentDoctorProfileId();

        doctorService.linkDoctorToHospital(
                myDoctorProfileId,
                hospitalId
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Linked to hospital successfully",
                                null
                        )
                );
    }


    // ============================================================
    // DOCTOR - VIEW PATIENT MEDICAL HISTORY
    // ============================================================

    @GetMapping("/patients/{patientProfileId}/history")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<MedicalHistoryEntryResponse>>> getPatientHistory(
            @PathVariable Long patientProfileId
    ) {

        Long doctorUserId =
                currentUserResolver.getCurrentUserId();

        List<MedicalHistoryEntryResponse> response =
                medicalHistoryService.getPatientHistoryForDoctor(
                        patientProfileId,
                        doctorUserId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Patient history fetched",
                        response
                )
        );
    }


    // ============================================================
    // DOCTOR - MY PATIENTS
    // ============================================================

    @GetMapping("/me/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<PatientListItemResponse>>> getMyPatients() {

        Long doctorUserId =
                currentUserResolver.getCurrentUserId();

        List<PatientListItemResponse> response =
                doctorService.getMyPatients(
                        doctorUserId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Patients fetched",
                        response
                )
        );
    }


    // ============================================================
    // FIND DOCTORS - CITIES
    // ============================================================

    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableCities() {

        List<String> cities =
                doctorService.getAvailableCities();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Cities fetched",
                        cities
                )
        );
    }


    // ============================================================
    // FIND DOCTORS - SPECIALIZATIONS
    // ============================================================

    @GetMapping("/specializations")
    public ResponseEntity<ApiResponse<List<SpecializationCountResponse>>> getSpecializations(
            @RequestParam String city
    ) {

        List<SpecializationCountResponse> response =
                doctorService.getSpecializationsForCity(
                        city
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Specializations fetched",
                        response
                )
        );
    }


    // ============================================================
    // GET CURRENT DOCTOR PROFILE ID
    // ============================================================

    private Long getCurrentDoctorProfileId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        DoctorProfile profile =
                doctorProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor profile not found"
                                )
                        );

        return profile.getId();
    }
}