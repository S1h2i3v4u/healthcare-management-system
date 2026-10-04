package com.healthcareapp.notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // In-app notification center list (§27) — most recent first.
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Unread count — typically shown as a small badge number on a bell icon.
    long countByUserIdAndIsReadFalse(Long userId);

    // Ownership guard, same pattern used everywhere else — before letting a
    // user mark a notification as read, confirm it's actually theirs.
    boolean existsByIdAndUserId(Long id, Long userId);
}