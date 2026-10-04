
package com.healthcareapp.hospital;

import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.hospital.dto.HospitalRequest;
import com.healthcareapp.hospital.dto.HospitalResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    // =========================================================
    // PUBLIC ENDPOINTS — no auth required
    // =========================================================

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HospitalResponse>>> searchHospitals(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String specialty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<HospitalResponse> results =
                hospitalService.searchHospitals(
                        name,
                        city,
                        area,
                        specialty,
                        pageable);

        return ResponseEntity.ok(
                ApiResponse.success("Hospitals fetched", results));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalResponse>> getHospitalById(
            @PathVariable Long id) {

        HospitalResponse response =
                hospitalService.getHospitalById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Hospital fetched", response));
    }

    // =========================================================
    // ADMIN — CREATE
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> createHospital(
            @Valid @RequestBody HospitalRequest request) {

        HospitalResponse response =
                hospitalService.createHospital(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Hospital created successfully",
                        response));
    }

    // =========================================================
    // ADMIN — UPDATE
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateHospital(
            @PathVariable Long id,
            @Valid @RequestBody HospitalRequest request) {

        HospitalResponse response =
                hospitalService.updateHospital(id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Hospital updated successfully",
                        response));
    }

    // =========================================================
    // ADMIN — DEACTIVATE
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> deactivateHospital(
            @PathVariable Long id) {

        hospitalService.deactivateHospital(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Hospital deactivated successfully",
                        null));
    }

    // =========================================================
    // ADMIN — LIST ALL HOSPITALS
    // Includes ACTIVE + INACTIVE hospitals
    // =========================================================

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<HospitalResponse>>> getAllHospitalsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<HospitalResponse> results =
                hospitalService.getAllHospitalsForAdmin(pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "All hospitals fetched",
                        results));
    }

    // =========================================================
    // ADMIN — REACTIVATE
    // =========================================================

    @PutMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> reactivateHospital(
            @PathVariable Long id) {

        hospitalService.reactivateHospital(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Hospital reactivated successfully",
                        null));
    }
}

