package com.healthcareapp.appointment;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcareapp.appointment.dto.AppointmentResponse;
import com.healthcareapp.appointment.dto.BookAppointmentRequest;
import com.healthcareapp.appointment.dto.CancelRequest;
import com.healthcareapp.appointment.dto.RescheduleRequest;
import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.security.CurrentUserResolver;
import com.healthcareapp.security.OwnershipService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final CurrentUserResolver currentUserResolver;
    private final OwnershipService ownershipService;


    // ============================================================
    // BOOK APPOINTMENT
    // ============================================================

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @Valid @RequestBody BookAppointmentRequest request) {

        Long userId = currentUserResolver.getCurrentUserId();

        AppointmentResponse response =
                appointmentService.bookAppointment(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Appointment booked successfully",
                        response
                ));
    }


    // ============================================================
    // GET MY APPOINTMENTS - PATIENT
    // ============================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments() {

        Long userId = currentUserResolver.getCurrentUserId();

        List<AppointmentResponse> appointments =
                appointmentService.getMyAppointmentsAsPatient(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Appointments fetched",
                        appointments
                )
        );
    }


    // ============================================================
    // GET MY APPOINTMENTS - DOCTOR
    // ============================================================

    @GetMapping("/my/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointmentsAsDoctor() {

        Long userId = currentUserResolver.getCurrentUserId();

        List<AppointmentResponse> appointments =
                appointmentService.getMyAppointmentsAsDoctor(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Appointments fetched",
                        appointments
                )
        );
    }


    // ============================================================
    // GET APPOINTMENT BY ID
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(
            @PathVariable Long id) {

        // Verify that the logged-in patient/doctor owns this appointment
        ownershipService.verifyCurrentUserOwnsAppointment(id);

        AppointmentResponse response =
                appointmentService.getAppointmentById(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Appointment fetched",
                        response
                )
        );
    }


    // ============================================================
    // CANCEL APPOINTMENT
    // ============================================================

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable Long id,
            @Valid @RequestBody CancelRequest request) {

        // First verify that the logged-in user owns this appointment
        ownershipService.verifyCurrentUserOwnsAppointment(id);

        // Get logged-in user's ID
        Long userId = currentUserResolver.getCurrentUserId();

        // Determine whether current user is PATIENT or DOCTOR
        String role = currentUserResolver.isCurrentUserPatient()
                ? "PATIENT"
                : "DOCTOR";

        AppointmentResponse response =
                appointmentService.cancelAppointment(
                        id,
                        userId,
                        role,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Appointment cancelled",
                        response
                )
        );
    }


    // ============================================================
    // RESCHEDULE APPOINTMENT
    // ============================================================

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {

        // Verify that the logged-in patient owns this appointment
        ownershipService.verifyCurrentUserOwnsAppointment(id);

        AppointmentResponse response =
                appointmentService.rescheduleAppointment(
                        id,
                        "PATIENT",
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Appointment rescheduled",
                        response
                )
        );
    }
}

