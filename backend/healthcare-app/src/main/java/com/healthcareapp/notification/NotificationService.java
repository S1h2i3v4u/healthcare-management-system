package com.healthcareapp.notification;

import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.notification.dto.NotificationResponse;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // The one method other services (Appointment, Consultation, etc.) call
    // to notify a user — mirrors AuditService.writeAuditLog()'s role as a
    // simple, centralized "record this thing happened" entry point. Same
    // transaction-joining behavior as AuditService: if called from inside
    // an existing @Transactional method and something later in that method
    // fails, this notification's creation rolls back too — which is
    // correct here, since a notification claiming "your appointment was
    // booked" shouldn't exist if the booking itself didn't actually commit.
    @Transactional
    public void createNotification(Long userId, String title, String message, Notification.NotificationType type) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {

        if (!notificationRepository.existsByIdAndUserId(notificationId, userId)) {
            // 404, not 403 — same reasoning applied consistently throughout
            // this project: don't confirm a notification with this ID
            // exists to a user it doesn't belong to.
            throw new ResourceNotFoundException("Notification not found");
        }

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // Convenience for "mark all as read" — a common UX affordance most
    // notification centers offer, not explicitly required by §27 but cheap
    // to add given the repository method already exists in spirit.
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());

        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}