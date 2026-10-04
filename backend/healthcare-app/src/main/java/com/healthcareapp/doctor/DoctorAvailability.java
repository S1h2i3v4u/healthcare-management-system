package com.healthcareapp.doctor;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

// Represents ONE working block for a doctor, e.g.
// "Monday, 09:00–13:00, 30-minute slots". A doctor with morning AND evening
// shifts on the same day (per §31's example) simply has two rows for Monday.
@Entity
@Table(name = "doctor_availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_profile_id", nullable = false)
    private DoctorProfile doctorProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // In minutes, e.g. 30 — used by AvailabilityService to generate bookable slots.
    @Column(name = "slot_duration_minutes", nullable = false)
    private Integer slotDurationMinutes;

    // Optional break window within the shift (e.g. lunch) — both null if no break.
    @Column(name = "break_start_time")
    private LocalTime breakStartTime;

    @Column(name = "break_end_time")
    private LocalTime breakEndTime;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}