package com.healthcareapp.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ============================================================
    // ACTIVE APPOINTMENT / SLOT CHECK
    // ============================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT a FROM Appointment a
            WHERE a.doctorProfile.id = :doctorProfileId
            AND a.appointmentDate = :date
            AND a.appointmentTime = :time
            AND a.status IN ('BOOKED', 'CONFIRMED', 'IN_PROGRESS')
            """)
    Optional<Appointment> findActiveAppointmentForSlot(
            @Param("doctorProfileId") Long doctorProfileId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time
    );

    // ============================================================
    // ACTIVE APPOINTMENTS FOR DOCTOR ON A DATE
    // ============================================================

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.doctorProfile.id = :doctorProfileId
            AND a.appointmentDate = :date
            AND a.status IN ('BOOKED', 'CONFIRMED', 'IN_PROGRESS')
            """)
    List<Appointment> findActiveAppointmentsForDate(
            @Param("doctorProfileId") Long doctorProfileId,
            @Param("date") LocalDate date
    );

    // ============================================================
    // PATIENT APPOINTMENTS
    // ============================================================

    List<Appointment> findByPatientProfileIdOrderByAppointmentDateDescAppointmentTimeDesc(
            Long patientProfileId
    );

    // ============================================================
    // DOCTOR APPOINTMENTS
    // ============================================================

    List<Appointment> findByDoctorProfileIdAndAppointmentDateOrderByAppointmentTimeAsc(
            Long doctorProfileId,
            LocalDate date
    );

    List<Appointment> findByDoctorProfileIdAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAscAppointmentTimeAsc(
            Long doctorProfileId,
            LocalDate fromDate
    );

    List<Appointment> findByDoctorProfileIdOrderByAppointmentDateDescAppointmentTimeDesc(
            Long doctorProfileId
    );

    // ============================================================
    // OWNERSHIP CHECKS
    // ============================================================

    boolean existsByIdAndPatientProfileId(
            Long id,
            Long patientProfileId
    );

    boolean existsByIdAndDoctorProfileId(
            Long id,
            Long doctorProfileId
    );

    // ============================================================
    // DOCTOR-PATIENT RELATIONSHIP CHECK
    // ============================================================

    /*
     * Used when a doctor wants to view a patient's medical history.
     *
     * The doctor is allowed to access the patient's history only
     * when at least one appointment exists between that doctor
     * and that patient.
     */

    boolean existsByPatientProfileIdAndDoctorProfileId(
            Long patientProfileId,
            Long doctorProfileId
    );

    // ============================================================
    // ADMIN / STATISTICS
    // ============================================================

    long countByStatus(AppointmentStatus status);

    long countByAppointmentDate(LocalDate date);

    // ============================================================
    // ADMIN / MANAGE APPOINTMENTS
    // ============================================================

    /*
     * Admin's "Manage Appointments" view.
     *
     * All filters are optional and can be combined:
     *
     * - doctorProfileId
     * - hospitalId
     * - status
     * - date
     *
     * No status restriction is applied when no status filter
     * is provided. Therefore admins can see every appointment
     * status, including CANCELLED and NO_SHOW.
     */

    @Query("""
            SELECT a FROM Appointment a
            WHERE (:doctorProfileId IS NULL
                   OR a.doctorProfile.id = :doctorProfileId)
            AND (:hospitalId IS NULL
                 OR a.hospital.id = :hospitalId)
            AND (:status IS NULL
                 OR a.status = :status)
            AND (:date IS NULL
                 OR a.appointmentDate = :date)
            ORDER BY a.appointmentDate DESC,
                     a.appointmentTime DESC
            """)
    Page<Appointment> searchAppointmentsForAdmin(
            @Param("doctorProfileId") Long doctorProfileId,
            @Param("hospitalId") Long hospitalId,
            @Param("status") AppointmentStatus status,
            @Param("date") LocalDate date,
            Pageable pageable
    );

    // ============================================================
    // APPOINTMENT REMINDERS
    // ============================================================

    @Query(value = """
            SELECT *
            FROM appointments
            WHERE status IN ('BOOKED', 'CONFIRMED')
              AND TIMESTAMP(appointment_date, appointment_time)
                  BETWEEN :windowStart AND :windowEnd
              AND (
                    (:reminderType = '24H' AND reminder_24h_sent = false)
                    OR
                    (:reminderType = '1H' AND reminder_1h_sent = false)
                  )
            """, nativeQuery = true)
    List<Appointment> findAppointmentsNeedingReminder(
            @Param("windowStart") LocalDateTime windowStart,
            @Param("windowEnd") LocalDateTime windowEnd,
            @Param("reminderType") String reminderType
    );
}