package com.healthcareapp.notification;

import java.time.LocalDateTime;

import com.healthcareapp.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// §27's notification fields, matched almost exactly: id, user_id, title,
// message, type, is_read, created_at. One row per notification per
// recipient — a "new appointment" notification for a doctor and the
// corresponding "appointment booked" notification for the patient are two
// SEPARATE rows, not one shared notification with two recipients, since
// their title/message text differs by audience.
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        APPOINTMENT_BOOKED,
        APPOINTMENT_CONFIRMED,
        APPOINTMENT_CANCELLED,
        APPOINTMENT_REMINDER,
        APPOINTMENT_COMPLETED,
        PRESCRIPTION_AVAILABLE,
        NEW_MEDICAL_REPORT,
        FOLLOW_UP_REMINDER,
        NEW_APPOINTMENT, // doctor-facing, per §27
        AMENDMENT_REVIEWED
    }
}