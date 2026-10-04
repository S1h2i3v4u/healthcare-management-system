package com.healthcareapp.appointment.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleRequest {

    @NotNull(message = "New date is required")
    @FutureOrPresent(message = "New date cannot be in the past")
    private LocalDate newDate;

    @NotNull(message = "New time is required")
    private LocalTime newTime;

    @NotBlank(message = "Reason for reschedule is required")
    private String reason;
}