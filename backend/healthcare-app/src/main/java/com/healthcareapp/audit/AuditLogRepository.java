package com.healthcareapp.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Admin's Audit Logs page (§26/§6) — filterable, paginated, most
    // recent first. All filters optional/combinable, same pattern used by
    // HospitalRepository.searchHospitals and DoctorProfileRepository.searchDoctors.
    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:userId IS NULL OR a.userId = :userId)
            AND (:action IS NULL OR a.action = :action)
            AND (:entityType IS NULL OR a.entityType = :entityType)
            ORDER BY a.createdAt DESC
            """)
    Page<AuditLog> searchAuditLogs(
            @Param("userId") Long userId,
            @Param("action") String action,
            @Param("entityType") String entityType,
            Pageable pageable
    );

    // Explicitly NO delete method anywhere on this interface — inheriting
    // JpaRepository technically still exposes deleteById()/delete() at the
    // Java level, since that can't be removed from the interface itself,
    // but no service in this codebase ever calls them, and no controller
    // endpoint ever exposes a delete action for audit logs. §26's "do not
    // allow normal users to delete audit logs" is enforced by simply never
    // wiring up that capability anywhere above this repository — flagged
    // here as a known limitation of Spring Data's interface model rather
    // than pretending this repository interface itself blocks deletion.
    // (A determined future developer could still technically call
    // auditLogRepository.deleteById(...) directly from new code — the real
    // protection is that no legitimate code path in THIS project does.)
}