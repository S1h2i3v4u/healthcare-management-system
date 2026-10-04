
package com.healthcareapp.patient;

import com.healthcareapp.appointment.Appointment;
import com.healthcareapp.appointment.AppointmentRepository;
import com.healthcareapp.appointment.AppointmentStatus;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.consultation.Consultation;
import com.healthcareapp.consultation.ConsultationRepository;
import com.healthcareapp.diagnosis.Diagnosis;
import com.healthcareapp.diagnosis.DiagnosisRepository;
import com.healthcareapp.doctor.DoctorProfile;
import com.healthcareapp.doctor.DoctorProfileRepository;
import com.healthcareapp.patient.dto.MedicalHistoryEntryResponse;
import com.healthcareapp.prescription.Prescription;
import com.healthcareapp.prescription.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalHistoryService {

    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;

    // ============================================================
    // PATIENT MEDICAL HISTORY
    // ============================================================
    //
    // Patient views their own medical history.
    //
    // Only COMPLETED appointments are included because BOOKED,
    // CONFIRMED, CANCELLED, etc. do not represent finalized
    // medical records.
    // ============================================================

    public List<MedicalHistoryEntryResponse> getMedicalHistory(
            Long patientUserId) {

        Long patientProfileId = patientProfileRepository
                .findByUserId(patientUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient profile not found"))
                .getId();

        List<Appointment> completedAppointments = appointmentRepository
                .findByPatientProfileIdOrderByAppointmentDateDescAppointmentTimeDesc(
                        patientProfileId)
                .stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        return completedAppointments.stream()
                .map(this::buildHistoryEntry)
                .sorted(
                        Comparator
                                .comparing(
                                        MedicalHistoryEntryResponse::getAppointmentDate)
                                .thenComparing(
                                        MedicalHistoryEntryResponse::getAppointmentTime)
                                .reversed()
                )
                .collect(Collectors.toList());
    }

    // ============================================================
    // DOCTOR VIEW OF A PATIENT'S MEDICAL HISTORY
    // ============================================================
    //
    // A doctor may NOT access the history of an arbitrary patient.
    //
    // Authorization rule:
    // The doctor must have at least one appointment with the patient.
    //
    // The relationship check is intentionally performed using the
    // doctorProfileId resolved from the authenticated doctor's user ID.
    // A client cannot supply a doctor ID and therefore cannot access
    // another doctor's patients.
    //
    // If there is no doctor-patient relationship, return 404 instead
    // of confirming whether the patient exists.
    // ============================================================

    public List<MedicalHistoryEntryResponse> getPatientHistoryForDoctor(
            Long patientProfileId,
            Long doctorUserId) {

        DoctorProfile doctor = doctorProfileRepository
                .findByUserId(doctorUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found"));

        boolean hasRelationship = appointmentRepository
                .existsByPatientProfileIdAndDoctorProfileId(
                        patientProfileId,
                        doctor.getId());

        if (!hasRelationship) {
            throw new ResourceNotFoundException("Patient not found");
        }

        List<Appointment> completedAppointments = appointmentRepository
                .findByPatientProfileIdOrderByAppointmentDateDescAppointmentTimeDesc(
                        patientProfileId)
                .stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        return completedAppointments.stream()
                .map(this::buildHistoryEntry)
                .sorted(
                        Comparator
                                .comparing(
                                        MedicalHistoryEntryResponse::getAppointmentDate)
                                .thenComparing(
                                        MedicalHistoryEntryResponse::getAppointmentTime)
                                .reversed()
                )
                .collect(Collectors.toList());
    }

    // ============================================================
    // BUILD HISTORY ENTRY
    // ============================================================

    private MedicalHistoryEntryResponse buildHistoryEntry(
            Appointment appointment) {

        Consultation consultation = consultationRepository
                .findByAppointmentId(appointment.getId())
                .orElse(null);

        String diagnosisSummary = null;
        String prescriptionSummary = null;
        Long consultationId = null;

        if (consultation != null) {

            consultationId = consultation.getId();

            Diagnosis diagnosis = diagnosisRepository
                    .findByConsultationId(consultation.getId())
                    .orElse(null);

            if (diagnosis != null) {
                diagnosisSummary = diagnosis.getDiagnosisName();
            }

            Prescription prescription = prescriptionRepository
                    .findByConsultationId(consultation.getId())
                    .orElse(null);

            if (prescription != null
                    && !prescription.getItems().isEmpty()) {

                prescriptionSummary =
                        prescription.getItems().size()
                                + " medicine(s) prescribed";
            }
        }

        return MedicalHistoryEntryResponse.builder()
                .appointmentId(appointment.getId())
                .consultationId(consultationId)
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .doctorName(
                        appointment
                                .getDoctorProfile()
                                .getUser()
                                .getFullName())
                .specialization(
                        appointment
                                .getDoctorProfile()
                                .getSpecialization())
                .hospitalName(
                        appointment
                                .getHospital()
                                .getName())
                .appointmentStatus(appointment.getStatus())
                .diagnosisSummary(diagnosisSummary)
                .prescriptionSummary(prescriptionSummary)
                .build();
    }
}

