package com.healthcareapp.notification;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.healthcareapp.appointment.Appointment;
import com.healthcareapp.appointment.AppointmentRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    /**
     * Runs every 15 minutes.
     *
     * Checks for:
     * 1. Appointments approximately 24 hours away
     * 2. Appointments approximately 1 hour away
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void sendUpcomingAppointmentReminders() {

        // Remove seconds/nanoseconds so appointments at exact minute
        // boundaries are not accidentally missed.
        LocalDateTime now =
                LocalDateTime.now().withSecond(0).withNano(0);

        send24HourReminders(now);
        send1HourReminders(now);
    }

    private void send24HourReminders(LocalDateTime now) {

        LocalDateTime windowStart = now.plusHours(24);
        LocalDateTime windowEnd = windowStart.plusMinutes(15);

        List<Appointment> candidates =
                appointmentRepository.findAppointmentsNeedingReminder(
                        windowStart,
                        windowEnd,
                        "24H"
                );

        for (Appointment appointment : candidates) {

            notificationService.createNotification(
                    appointment.getPatientProfile().getUser().getId(),
                    "Appointment Reminder",
                    "You have an appointment with Dr. "
                            + appointment.getDoctorProfile().getUser().getFullName()
                            + " tomorrow at "
                            + appointment.getAppointmentTime()
                            + ".",
                    Notification.NotificationType.APPOINTMENT_REMINDER
            );

            // Prevent duplicate 24-hour reminders
            appointment.setReminder24hSent(true);
            appointmentRepository.save(appointment);
        }
    }

    private void send1HourReminders(LocalDateTime now) {

        LocalDateTime windowStart = now.plusHours(1);
        LocalDateTime windowEnd = windowStart.plusMinutes(15);

        List<Appointment> candidates =
                appointmentRepository.findAppointmentsNeedingReminder(
                        windowStart,
                        windowEnd,
                        "1H"
                );

        for (Appointment appointment : candidates) {

            notificationService.createNotification(
                    appointment.getPatientProfile().getUser().getId(),
                    "Appointment Reminder",
                    "You have an appointment with Dr. "
                            + appointment.getDoctorProfile().getUser().getFullName()
                            + " in about 1 hour, at "
                            + appointment.getAppointmentTime()
                            + ".",
                    Notification.NotificationType.APPOINTMENT_REMINDER
            );

            // Prevent duplicate 1-hour reminders
            appointment.setReminder1hSent(true);
            appointmentRepository.save(appointment);
        }
    }
}