package com.healthcareapp.hospital;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    // Basic existence check — used by HospitalService to avoid duplicate names
    // in the same city.
    boolean existsByNameIgnoreCaseAndCity(String name, String city);

    // Powers hospital search for patients.
    // Only ACTIVE hospitals are visible to patients.
    @Query("""
            SELECT h FROM Hospital h
            WHERE h.status = com.healthcareapp.hospital.Hospital$HospitalStatus.ACTIVE
            AND (:name IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%')))
            AND (:city IS NULL OR LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')))
            AND (:area IS NULL OR LOWER(h.address) LIKE LOWER(CONCAT('%', :area, '%')))
            AND (:specialty IS NULL OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :specialty, '%')))
            """)
    Page<Hospital> searchHospitals(
            @Param("name") String name,
            @Param("city") String city,
            @Param("area") String area,
            @Param("specialty") String specialty,
            Pageable pageable
    );

    // Admin's hospital management view.
    // Unlike searchHospitals(), this does NOT filter by ACTIVE status.
    // Therefore admins can see both ACTIVE and INACTIVE hospitals.
    // This is required so inactive hospitals can later be reactivated.
    Page<Hospital> findAllByOrderByNameAsc(Pageable pageable);

    // Used by admin dashboard.
    long countByStatus(Hospital.HospitalStatus status);
}