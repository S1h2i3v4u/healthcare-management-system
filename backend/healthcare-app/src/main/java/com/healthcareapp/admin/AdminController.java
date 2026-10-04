package com.healthcareapp.admin;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcareapp.admin.dto.AdminDashboardResponse;
import com.healthcareapp.admin.dto.AdminDoctorListResponse;
import com.healthcareapp.admin.dto.AdminPatientListResponse;
import com.healthcareapp.appointment.AppointmentStatus;
import com.healthcareapp.appointment.dto.AppointmentResponse;
import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.doctor.VerificationStatus;
import com.healthcareapp.security.CurrentUserResolver;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CurrentUserResolver currentUserResolver;

    // ===== Dashboard =====

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {

        AdminDashboardResponse response =
                adminService.getDashboard();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard data fetched",
                        response
                )
        );
    }

    // ===== Manage Doctors =====

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<Page<AdminDoctorListResponse>>> getDoctors(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<AdminDoctorListResponse> response =
                adminService.getDoctorsForAdmin(status, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Doctors fetched",
                        response
                )
        );
    }

    @PutMapping("/doctors/{doctorProfileId}/verify")
    public ResponseEntity<ApiResponse<Object>> verifyDoctor(
            @PathVariable Long doctorProfileId) {

        Long adminUserId =
                currentUserResolver.getCurrentUserId();

        adminService.verifyDoctor(
                doctorProfileId,
                adminUserId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Doctor verified successfully",
                        null
                )
        );
    }

    @PutMapping("/doctors/{doctorProfileId}/reject")
    public ResponseEntity<ApiResponse<Object>> rejectDoctor(
            @PathVariable Long doctorProfileId) {

        Long adminUserId =
                currentUserResolver.getCurrentUserId();

        adminService.rejectDoctor(
                doctorProfileId,
                adminUserId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Doctor rejected",
                        null
                )
        );
    }

    // ===== Manage Patients =====

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<Page<AdminPatientListResponse>>> getPatients(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<AdminPatientListResponse> response =
                adminService.getPatients(search, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Patients fetched",
                        response
                )
        );
    }

    @PutMapping("/patients/{patientUserId}/suspend")
    public ResponseEntity<ApiResponse<Object>> suspendPatient(
            @PathVariable Long patientUserId) {

        Long adminUserId =
                currentUserResolver.getCurrentUserId();

        adminService.suspendPatient(
                patientUserId,
                adminUserId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Patient suspended",
                        null
                )
        );
    }

    @PutMapping("/patients/{patientUserId}/activate")
    public ResponseEntity<ApiResponse<Object>> activatePatient(
            @PathVariable Long patientUserId) {

        Long adminUserId =
                currentUserResolver.getCurrentUserId();

        adminService.activatePatient(
                patientUserId,
                adminUserId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Patient activated",
                        null
                )
        );
    }

    // ===== Manage Appointments =====

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getAppointments(
            @RequestParam(required = false) Long doctorProfileId,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<AppointmentResponse> response =
                adminService.getAppointmentsForAdmin(
                        doctorProfileId,
                        hospitalId,
                        status,
                        date,
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Appointments fetched",
                        response
                )
        );
    }
}