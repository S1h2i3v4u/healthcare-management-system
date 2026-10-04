package com.healthcareapp.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

// Represents ONE bookable time slot for a doctor on a specific date —
// this is what §11 shows as the flat list (09:00 AM, 09:30 AM, ...),
// but with a "taken" flag so the frontend can render already-booked
// slots as disabled instead of hiding them entirely.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlotResponse {

    private LocalDate date;
    private LocalTime time;
    private boolean available;
}