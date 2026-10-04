package com.healthcareapp.doctor;

import com.healthcareapp.doctor.dto.AvailabilitySlotResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

    // Generates every bookable slot for a doctor on a given date, derived from
    // their recurring weekly DoctorAvailability rows for that day of week.
    public List<AvailabilitySlotResponse> generateSlotsForDate(Long doctorProfileId, LocalDate date) {

        DayOfWeek dayOfWeek = date.getDayOfWeek();

        List<DoctorAvailability> shifts = doctorAvailabilityRepository
                .findByDoctorProfileIdAndDayOfWeekAndActiveTrue(doctorProfileId, dayOfWeek);

        List<AvailabilitySlotResponse> slots = new ArrayList<>();

        for (DoctorAvailability shift : shifts) {
            slots.addAll(generateSlotsForShift(shift, date));
        }

        // TODO (Phase 3 — Appointment Booking): once the Appointment entity
        // exists, fetch all BOOKED/CONFIRMED appointments for this doctor on
        // this date here, and set available=false on any slot whose time
        // matches an existing appointment's time. Until then, every slot
        // generated below is marked available=true.

        slots.sort((a, b) -> a.getTime().compareTo(b.getTime()));
        return slots;
    }

    private List<AvailabilitySlotResponse> generateSlotsForShift(DoctorAvailability shift, LocalDate date) {

        List<AvailabilitySlotResponse> slots = new ArrayList<>();

        LocalTime current = shift.getStartTime();
        int durationMinutes = shift.getSlotDurationMinutes();

        while (!current.plusMinutes(durationMinutes).isAfter(shift.getEndTime())) {

            boolean fallsInBreak = shift.getBreakStartTime() != null
                    && shift.getBreakEndTime() != null
                    && !current.isBefore(shift.getBreakStartTime())
                    && current.isBefore(shift.getBreakEndTime());

            if (!fallsInBreak) {
                slots.add(AvailabilitySlotResponse.builder()
                        .date(date)
                        .time(current)
                        .available(true)
                        .build());
            }

            current = current.plusMinutes(durationMinutes);
        }

        return slots;
    }
}