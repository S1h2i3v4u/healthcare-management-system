package com.healthcareapp.notification;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcareapp.common.ApiResponse;
import com.healthcareapp.notification.dto.NotificationResponse;
import com.healthcareapp.security.CurrentUserResolver;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserResolver currentUserResolver;

    // No @PreAuthorize role restriction — any authenticated user (patient,
    // doctor, or admin) has their own notifications; this isn't a
    // role-specific feature the way most other controllers have been.
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications() {

        Long userId = currentUserResolver.getCurrentUserId();
        List<NotificationResponse> response = notificationService.getMyNotifications(userId);

        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", response));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {

        Long userId = currentUserResolver.getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);

        return ResponseEntity.ok(ApiResponse.success("Unread count fetched", Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Object>> markAsRead(@PathVariable Long id) {

        Long userId = currentUserResolver.getCurrentUserId();
        notificationService.markAsRead(id, userId);

        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Object>> markAllAsRead() {

        Long userId = currentUserResolver.getCurrentUserId();
        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}