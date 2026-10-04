package com.healthcareapp.doctor;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    // Used by AvailabilityService to generate slots for a specific date —
    // fetches all active shifts for a doctor on a given day of the week.
    List<DoctorAvailability> findByDoctorProfileIdAndDayOfWeekAndActiveTrue(
            Long doctorProfileId, DayOfWeek dayOfWeek);

    // Used by "Schedule Management" page — a doctor viewing/editing their
    // full weekly configuration across all days.
    List<DoctorAvailability> findByDoctorProfileIdOrderByDayOfWeekAscStartTimeAsc(Long doctorProfileId);

    // Used when a doctor deletes/replaces one specific shift block.
    boolean existsByIdAndDoctorProfileId(Long id, Long doctorProfileId);
}