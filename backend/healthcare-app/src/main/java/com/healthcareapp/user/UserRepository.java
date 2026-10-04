package com.healthcareapp.user;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.healthcareapp.auth.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByMobileNumber(String mobileNumber);

    long countByRole(Role role);

    // Admin's "Manage Patients" search (§6) — optional name/email filter,
    // combinable, same pattern as every other admin/search query in this
    // project. Only ever returns PATIENT role rows.
    @Query("""
            SELECT u FROM User u
            WHERE u.role = 'PATIENT'
            AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY u.createdAt DESC
            """)
    Page<User> searchPatients(@Param("search") String search, Pageable pageable);
}