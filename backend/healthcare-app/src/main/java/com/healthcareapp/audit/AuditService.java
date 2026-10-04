package com.healthcareapp.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    // The one method every other service calls to record an action. Kept
    // deliberately simple — a single flat method rather than a builder
    // pattern or multiple overloads — so calling it from deep inside an
    // existing transactional method (like ConsultationService.
    // completeConsultation()) is a one-line addition, not a structural change.
    //
    // REQUIRES_EXISTING (the default propagation, used here implicitly) is
    // actually what we want in most call sites: when writeAuditLog() is
    // called from INSIDE completeConsultation()'s existing @Transactional
    // method, this write joins that SAME transaction — meaning if anything
    // later in that method fails and rolls back, the audit log entry rolls
    // back too. This is intentional: an audit entry claiming "record was
    // locked" should never survive if the locking itself didn't actually
    // succeed. Audit correctness here means "accurately reflects what
    // really happened," not "always write no matter what."
    public void writeAuditLog(Long userId, String role, String action,
                               String entityType, Long entityId, String details) {

        AuditLog log = AuditLog.builder()
                .userId(userId)
                .role(role)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();

        auditLogRepository.save(log);
    }

    // Overload for login/logout events, which have no entityId/entityType
    // (a login isn't "about" a database row the way "APPOINTMENT_BOOKED"
    // is about a specific Appointment).
    public void writeAuditLog(Long userId, String role, String action, String details) {
        writeAuditLog(userId, role, action, null, null, details);
    }
}