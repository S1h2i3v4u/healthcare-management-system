package com.healthcareapp.patient.dto;

import com.healthcareapp.appointment.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

// One row in the patient's medical history timeline (§21) — one entry per
// COMPLETED appointment, most recent first. Deliberately flatter than
// ConsultationResponse: the timeline view is a summary list ("[View Full
// Consultation]" per §21's mockup), not the full detail page — that detail
// page is exactly ConsultationResponse, already built, reused via its own
// endpoint rather than duplicated here.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistoryEntryResponse {

    private Long appointmentId;
    private Long consultationId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String doctorName;
    private String specialization;
    private String hospitalName;
    private AppointmentStatus appointmentStatus;

    // Short summary fields for the timeline card itself — NOT the full
    // consultation detail (that's a separate "View Full Consultation" call
    // to the existing GET /api/appointments/{id}/consultation endpoint).
    private String diagnosisSummary;
    private String prescriptionSummary; // e.g. "3 medicines prescribed"
}