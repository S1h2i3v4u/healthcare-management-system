package com.healthcareapp.hospital;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.hospital.dto.HospitalRequest;
import com.healthcareapp.hospital.dto.HospitalResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    // =========================================================
    // CREATE HOSPITAL — ADMIN
    // =========================================================

    @Transactional
    public HospitalResponse createHospital(HospitalRequest request) {

        if (hospitalRepository.existsByNameIgnoreCaseAndCity(
                request.getName(),
                request.getCity())) {

            throw new ConflictException(
                    "A hospital with this name already exists in "
                            + request.getCity());
        }

        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .phone(request.getPhone())
                .email(request.getEmail())
                .website(request.getWebsite())
                .specialties(request.getSpecialties())
                .imageUrl(request.getImageUrl())
                .status(Hospital.HospitalStatus.ACTIVE)
                .build();

        Hospital saved = hospitalRepository.save(hospital);

        return HospitalResponse.fromEntity(saved);
    }

    // =========================================================
    // UPDATE HOSPITAL — ADMIN
    // =========================================================

    @Transactional
    public HospitalResponse updateHospital(
            Long hospitalId,
            HospitalRequest request) {

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        hospital.setName(request.getName());
        hospital.setDescription(request.getDescription());
        hospital.setAddress(request.getAddress());
        hospital.setCity(request.getCity());
        hospital.setState(request.getState());
        hospital.setPincode(request.getPincode());
        hospital.setPhone(request.getPhone());
        hospital.setEmail(request.getEmail());
        hospital.setWebsite(request.getWebsite());
        hospital.setSpecialties(request.getSpecialties());
        hospital.setImageUrl(request.getImageUrl());

        // Status is intentionally NOT changed here.
        // Use deactivateHospital() or reactivateHospital()
        // for status changes.

        Hospital updated = hospitalRepository.save(hospital);

        return HospitalResponse.fromEntity(updated);
    }

    // =========================================================
    // DEACTIVATE HOSPITAL — ADMIN
    // =========================================================

    @Transactional
    public void deactivateHospital(Long hospitalId) {

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        // Soft delete only.
        // Existing doctors/appointments referencing this hospital
        // remain intact.
        hospital.setStatus(Hospital.HospitalStatus.INACTIVE);

        hospitalRepository.save(hospital);
    }

    // =========================================================
    // ADMIN — LIST ALL HOSPITALS
    // Includes ACTIVE + INACTIVE hospitals
    // =========================================================

    public Page<HospitalResponse> getAllHospitalsForAdmin(
            Pageable pageable) {

        return hospitalRepository
                .findAllByOrderByNameAsc(pageable)
                .map(HospitalResponse::fromEntity);
    }

    // =========================================================
    // ADMIN — REACTIVATE HOSPITAL
    // =========================================================

    @Transactional
    public void reactivateHospital(Long hospitalId) {

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        hospital.setStatus(Hospital.HospitalStatus.ACTIVE);

        hospitalRepository.save(hospital);
    }

    // =========================================================
    // GET HOSPITAL BY ID
    // =========================================================

    public HospitalResponse getHospitalById(Long hospitalId) {

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        return HospitalResponse.fromEntity(hospital);
    }

    // =========================================================
    // PUBLIC HOSPITAL SEARCH
    // Only ACTIVE hospitals are returned by repository query
    // =========================================================

    public Page<HospitalResponse> searchHospitals(
            String name,
            String city,
            String area,
            String specialty,
            Pageable pageable) {

        return hospitalRepository
                .searchHospitals(
                        name,
                        city,
                        area,
                        specialty,
                        pageable)
                .map(HospitalResponse::fromEntity);
    }
}
