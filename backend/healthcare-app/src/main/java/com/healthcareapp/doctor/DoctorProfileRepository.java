package com.healthcareapp.doctor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    Optional<DoctorProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByMedicalRegistrationNumber(String medicalRegistrationNumber);

    long countByVerificationStatus(VerificationStatus status);

    // ============================================================
    // ADMIN - DOCTOR MANAGEMENT
    // ============================================================

    /*
     * Returns all doctors for the admin view.
     *
     * If status is provided, only doctors with that verification
     * status are returned.
     *
     * If status is null, all doctors are returned.
     */
    @Query("""
            SELECT d FROM DoctorProfile d
            WHERE (:status IS NULL OR d.verificationStatus = :status)
            ORDER BY d.createdAt DESC
            """)
    Page<DoctorProfile> findAllForAdmin(
            @Param("status") VerificationStatus status,
            Pageable pageable
    );

    // ============================================================
    // PATIENT - DOCTOR SEARCH
    // ============================================================

    @Query("""
        SELECT d
        FROM DoctorProfile d
        WHERE d.verificationStatus = com.healthcareapp.doctor.VerificationStatus.VERIFIED
          AND (:name IS NULL OR LOWER(d.user.fullName) LIKE LOWER(CONCAT('%', :name, '%')))
          AND (:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%')))
          AND (:city IS NULL OR LOWER(d.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:minExperience IS NULL OR d.yearsOfExperience >= :minExperience)
          AND (:maxFee IS NULL OR d.consultationFee <= :maxFee)
        """)
    Page<DoctorProfile> searchDoctors(
            @Param("name") String name,
            @Param("specialization") String specialization,
            @Param("city") String city,
            @Param("minExperience") Integer minExperience,
            @Param("maxFee") BigDecimal maxFee,
            Pageable pageable
    );

    // ============================================================
    // FIND DOCTORS - AVAILABLE CITIES
    // ============================================================

    /*
     * Returns distinct cities that have at least one VERIFIED
     * doctor.
     *
     * This powers the city selection/filter on Find Doctors.
     */
    @Query("""
            SELECT DISTINCT d.city
            FROM DoctorProfile d
            WHERE d.verificationStatus = 'VERIFIED'
            ORDER BY d.city ASC
            """)
    List<String> findDistinctCities();

    // ============================================================
    // FIND DOCTORS - SPECIALIZATIONS BY CITY
    // ============================================================

    /*
     * Returns available specializations within a city along with
     * the number of verified doctors in each specialization.
     *
     * Example:
     *
     * Cardiology (4)
     * Dermatology (2)
     * Neurology (3)
     */
    @Query("""
            SELECT d.specialization AS specialization,
                   COUNT(d) AS doctorCount
            FROM DoctorProfile d
            WHERE d.verificationStatus = 'VERIFIED'
              AND d.city = :city
            GROUP BY d.specialization
            ORDER BY d.specialization ASC
            """)
    List<SpecializationCountProjection> findSpecializationCountsByCity(
            @Param("city") String city
    );

    // ============================================================
    // PROJECTION
    // ============================================================

    interface SpecializationCountProjection {

        String getSpecialization();

        Long getDoctorCount();
    }
}