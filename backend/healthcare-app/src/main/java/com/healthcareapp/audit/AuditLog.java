package com.healthcareapp.audit;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// §26: a permanent, append-only trail of security/medical-record-relevant
// actions. Deliberately has NO update/delete capability anywhere in this
// codebase — not even an admin can modify or remove entries (§26: "Do not
// allow normal users to delete audit logs" — extended here to mean nobody
// gets a delete path at all, since a genuinely tamperable audit log
// defeats its own purpose).
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId; // nullable — some events (e.g. failed login with unknown email) have no resolvable user

    @Column(name = "role")
    private String role; // snapshot of the role AT THE TIME of the action — not a live FK to User

    @Column(nullable = false)
    private String action; // e.g. "APPOINTMENT_BOOKED", "MEDICAL_RECORD_LOCKED", "LOGIN"

    @Column(name = "entity_type")
    private String entityType; // e.g. "Appointment", "Consultation"

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // optional free-text context, e.g. cancellation reason

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}