package com.healthcareapp.doctor.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;

import com.healthcareapp.doctor.DoctorAvailability;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailabilityResponse {
    private Long id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDurationMinutes;
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
    private boolean active;

    public static DoctorAvailabilityResponse fromEntity(DoctorAvailability a) {
        return DoctorAvailabilityResponse.builder()
                .id(a.getId())
                .dayOfWeek(a.getDayOfWeek())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .slotDurationMinutes(a.getSlotDurationMinutes())
                .breakStartTime(a.getBreakStartTime())
                .breakEndTime(a.getBreakEndTime())
                .active(a.isActive())
                .build();
    }
}