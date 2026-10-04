package com.healthcareapp.consultation;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcareapp.appointment.Appointment;
import com.healthcareapp.appointment.AppointmentRepository;
import com.healthcareapp.appointment.AppointmentStatus;
import com.healthcareapp.audit.AuditService;
import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.consultation.dto.CompleteConsultationRequest;
import com.healthcareapp.consultation.dto.ConsultationDraftRequest;
import com.healthcareapp.consultation.dto.ConsultationResponse;
import com.healthcareapp.diagnosis.Diagnosis;
import com.healthcareapp.diagnosis.DiagnosisRepository;
import com.healthcareapp.doctor.DoctorProfile;
import com.healthcareapp.notification.Notification;
import com.healthcareapp.notification.NotificationService;
import com.healthcareapp.prescription.Prescription;
import com.healthcareapp.prescription.PrescriptionItem;
import com.healthcareapp.prescription.PrescriptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final VitalsRepository vitalsRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;

    private final AuditService auditService;
    private final NotificationService notificationService;


    // ============================================================
    // SAVE DRAFT
    // ============================================================

    @Transactional
    public ConsultationResponse saveDraft(
            Long appointmentId,
            Long doctorUserId,
            ConsultationDraftRequest request) {

        Appointment appointment =
                getAppointmentOwnedByDoctor(
                        appointmentId,
                        doctorUserId
                );

        Consultation consultation =
                consultationRepository.findByAppointmentId(appointmentId)
                        .orElseGet(() ->
                                createNewDraftConsultation(appointment)
                        );

        // Locked consultation cannot be edited
        if (consultation.getStatus() == ConsultationStatus.LOCKED) {
            throw new ConflictException(
                    "This consultation is already locked and cannot be edited."
            );
        }

        // --------------------------------------------------------
        // Consultation fields
        // --------------------------------------------------------

        consultation.setChiefComplaint(
                request.getChiefComplaint()
        );

        consultation.setSymptoms(
                request.getSymptoms()
        );

        consultation.setExaminationNotes(
                request.getExaminationNotes()
        );

        consultation.setMedicalAdvice(
                request.getMedicalAdvice()
        );

        consultation.setFollowUpRequired(
                request.getFollowUpRequired()
        );

        consultation.setFollowUpDate(
                request.getFollowUpDate()
        );

        consultation.setFollowUpInstructions(
                request.getFollowUpInstructions()
        );

        Consultation savedConsultation =
                consultationRepository.save(consultation);

        // --------------------------------------------------------
        // Child records
        // --------------------------------------------------------

        Vitals vitals =
                upsertVitalsIfPresent(
                        savedConsultation,
                        request.getVitals()
                );

        Diagnosis diagnosis =
                upsertDiagnosisIfPresent(
                        savedConsultation,
                        request.getDiagnosis()
                );

        Prescription prescription =
                upsertPrescriptionIfPresent(
                        savedConsultation,
                        request.getPrescriptionItems()
                );

        // --------------------------------------------------------
        // Appointment status
        // --------------------------------------------------------

        if (appointment.getStatus() == AppointmentStatus.CONFIRMED
                || appointment.getStatus() == AppointmentStatus.BOOKED) {

            appointment.setStatus(
                    AppointmentStatus.IN_PROGRESS
            );

            appointmentRepository.save(appointment);
        }

        return ConsultationResponse.fromEntity(
                savedConsultation,
                vitals,
                diagnosis,
                prescription
        );
    }


    // ============================================================
    // COMPLETE CONSULTATION
    // ============================================================

    @Transactional
    public ConsultationResponse completeConsultation(
            Long appointmentId,
            Long doctorUserId,
            CompleteConsultationRequest request) {

        // --------------------------------------------------------
        // 1. Verify doctor owns appointment
        // --------------------------------------------------------

        Appointment appointment =
                getAppointmentOwnedByDoctor(
                        appointmentId,
                        doctorUserId
                );

        // --------------------------------------------------------
        // 2. Validate appointment status
        // --------------------------------------------------------

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new ConflictException(
                    "This appointment has already been completed."
            );
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new ConflictException(
                    "Cannot complete a cancelled appointment."
            );
        }

        // --------------------------------------------------------
        // 3. Get or create consultation
        // --------------------------------------------------------

        Consultation consultation =
                consultationRepository.findByAppointmentId(appointmentId)
                        .orElseGet(() ->
                                createNewDraftConsultation(appointment)
                        );

        // --------------------------------------------------------
        // 4. Prevent editing locked consultation
        // --------------------------------------------------------

        if (consultation.getStatus() == ConsultationStatus.LOCKED) {
            throw new ConflictException(
                    "This consultation is already locked."
            );
        }

        // --------------------------------------------------------
        // 5. Follow-up validation
        // --------------------------------------------------------

        if (Boolean.TRUE.equals(request.getFollowUpRequired())
                && request.getFollowUpDate() == null) {

            throw new ConflictException(
                    "Follow-up date is required when follow-up is marked as required."
            );
        }

        // --------------------------------------------------------
        // 6. Save consultation information
        // --------------------------------------------------------

        consultation.setChiefComplaint(
                request.getChiefComplaint()
        );

        consultation.setSymptoms(
                request.getSymptoms()
        );

        consultation.setExaminationNotes(
                request.getExaminationNotes()
        );

        consultation.setMedicalAdvice(
                request.getMedicalAdvice()
        );

        consultation.setFollowUpRequired(
                request.getFollowUpRequired()
        );

        consultation.setFollowUpDate(
                request.getFollowUpDate()
        );

        consultation.setFollowUpInstructions(
                request.getFollowUpInstructions()
        );

        // --------------------------------------------------------
        // 7. LOCK MEDICAL RECORD
        // --------------------------------------------------------

        consultation.setStatus(
                ConsultationStatus.LOCKED
        );

        consultation.setCompletedAt(
                LocalDateTime.now()
        );

        consultation.setCompletedByDoctorId(
                appointment.getDoctorProfile().getId()
        );

        Consultation savedConsultation =
                consultationRepository.save(consultation);

        // --------------------------------------------------------
        // 8. Save diagnosis
        // --------------------------------------------------------

        Diagnosis diagnosis =
                upsertDiagnosisIfPresent(
                        savedConsultation,
                        request.getDiagnosis()
                );

        // --------------------------------------------------------
        // 9. Save vitals
        // --------------------------------------------------------

        Vitals vitals =
                upsertVitalsIfPresent(
                        savedConsultation,
                        request.getVitals()
                );

        // --------------------------------------------------------
        // 10. Save prescription
        // --------------------------------------------------------

        Prescription prescription =
                upsertPrescriptionIfPresent(
                        savedConsultation,
                        request.getPrescriptionItems()
                );

        // --------------------------------------------------------
        // 11. Mark appointment completed
        // --------------------------------------------------------

        appointment.setStatus(
                AppointmentStatus.COMPLETED
        );

        appointmentRepository.save(appointment);

        // --------------------------------------------------------
        // 12. Audit log
        // --------------------------------------------------------

        auditService.writeAuditLog(
                doctorUserId,
                "DOCTOR",
                "MEDICAL_RECORD_LOCKED",
                "Consultation",
                savedConsultation.getId(),
                "Appointment #" + appointment.getId()
                        + " completed and locked"
        );

        // --------------------------------------------------------
        // 13. Patient notification
        // --------------------------------------------------------

        notificationService.createNotification(
                appointment
                        .getPatientProfile()
                        .getUser()
                        .getId(),

                "Appointment Completed",

                "Your consultation with Dr. "
                        + appointment
                        .getDoctorProfile()
                        .getUser()
                        .getFullName()
                        + " is complete. Your prescription and records are now available.",

                Notification.NotificationType.APPOINTMENT_COMPLETED
        );

        // --------------------------------------------------------
        // 14. Prescription notification
        // --------------------------------------------------------

        notificationService.createNotification(
                appointment
                        .getPatientProfile()
                        .getUser()
                        .getId(),

                "Prescription Available",

                "A new prescription has been added to your medical records.",

                Notification.NotificationType.PRESCRIPTION_AVAILABLE
        );

        // --------------------------------------------------------
        // 15. Return response
        // --------------------------------------------------------

        return ConsultationResponse.fromEntity(
                savedConsultation,
                vitals,
                diagnosis,
                prescription
        );
    }


    // ============================================================
    // GET CONSULTATION
    // ============================================================

    public ConsultationResponse getConsultationByAppointmentId(
            Long appointmentId) {

        Consultation consultation =
                consultationRepository.findByAppointmentId(
                        appointmentId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Consultation not found for this appointment"
                        )
                );

        Vitals vitals =
                vitalsRepository.findByConsultationId(
                        consultation.getId()
                ).orElse(null);

        Diagnosis diagnosis =
                diagnosisRepository.findByConsultationId(
                        consultation.getId()
                ).orElse(null);

        Prescription prescription =
                prescriptionRepository.findByConsultationId(
                        consultation.getId()
                ).orElse(null);

        return ConsultationResponse.fromEntity(
                consultation,
                vitals,
                diagnosis,
                prescription
        );
    }


    // ============================================================
    // GET APPOINTMENT OWNED BY DOCTOR
    // ============================================================

    private Appointment getAppointmentOwnedByDoctor(
            Long appointmentId,
            Long doctorUserId) {

        Appointment appointment =
                appointmentRepository.findById(appointmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                )
                        );

        DoctorProfile doctorProfile =
                appointment.getDoctorProfile();

        /*
         * Return 404 instead of 403 so an unauthorized doctor
         * cannot confirm that the appointment exists.
         */
        if (!doctorProfile
                .getUser()
                .getId()
                .equals(doctorUserId)) {

            throw new ResourceNotFoundException(
                    "Appointment not found"
            );
        }

        return appointment;
    }


    // ============================================================
    // CREATE NEW DRAFT CONSULTATION
    // ============================================================

    private Consultation createNewDraftConsultation(
            Appointment appointment) {

        Consultation consultation =
                Consultation.builder()
                        .appointment(appointment)
                        .doctorProfile(
                                appointment.getDoctorProfile()
                        )
                        .status(
                                ConsultationStatus.DRAFT
                        )
                        .build();

        return consultationRepository.save(
                consultation
        );
    }


    // ============================================================
    // UPSERT VITALS
    // ============================================================

    private Vitals upsertVitalsIfPresent(
            Consultation consultation,
            ConsultationDraftRequest.VitalsInput input) {

        if (input == null) {
            return null;
        }

        Vitals vitals =
                vitalsRepository.findByConsultationId(
                        consultation.getId()
                ).orElseGet(() ->
                        Vitals.builder()
                                .consultation(consultation)
                                .build()
                );

        vitals.setBloodPressure(
                input.getBloodPressure()
        );

        vitals.setHeartRate(
                input.getHeartRate()
        );

        vitals.setTemperature(
                input.getTemperature()
        );

        vitals.setRespiratoryRate(
                input.getRespiratoryRate()
        );

        vitals.setOxygenSaturation(
                input.getOxygenSaturation()
        );

        vitals.setHeightCm(
                input.getHeightCm()
        );

        vitals.setWeightKg(
                input.getWeightKg()
        );

        return vitalsRepository.save(
                vitals
        );
    }


    // ============================================================
    // UPSERT DIAGNOSIS
    // ============================================================

    private Diagnosis upsertDiagnosisIfPresent(
            Consultation consultation,
            ConsultationDraftRequest.DiagnosisInput input) {

        if (input == null) {
            return null;
        }

        Diagnosis diagnosis =
                diagnosisRepository.findByConsultationId(
                        consultation.getId()
                ).orElseGet(() ->
                        Diagnosis.builder()
                                .consultation(consultation)
                                .build()
                );

        diagnosis.setDiagnosisName(
                input.getDiagnosisName()
        );

        diagnosis.setDiagnosisDescription(
                input.getDiagnosisDescription()
        );

        diagnosis.setIcdCode(
                input.getIcdCode()
        );

        return diagnosisRepository.save(
                diagnosis
        );
    }


    // ============================================================
    // UPSERT PRESCRIPTION
    // ============================================================

    private Prescription upsertPrescriptionIfPresent(
            Consultation consultation,
            List<ConsultationDraftRequest.PrescriptionItemInput> itemInputs) {

        if (itemInputs == null) {
            return null;
        }

        Prescription prescription =
                prescriptionRepository.findByConsultationId(
                        consultation.getId()
                ).orElseGet(() ->
                        Prescription.builder()
                                .consultation(consultation)
                                .items(new ArrayList<>())
                                .build()
                );

        /*
         * Replace all existing prescription items.
         */
        prescription.getItems().clear();

        for (ConsultationDraftRequest.PrescriptionItemInput itemInput
                : itemInputs) {

            PrescriptionItem item =
                    PrescriptionItem.builder()
                            .prescription(prescription)

                            .medicineName(
                                    itemInput.getMedicineName()
                            )

                            .dosage(
                                    itemInput.getDosage()
                            )

                            .frequency(
                                    itemInput.getFrequency()
                            )

                            .route(
                                    itemInput.getRoute()
                            )

                            .duration(
                                    itemInput.getDuration()
                            )

                            .quantity(
                                    itemInput.getQuantity()
                            )

                            .instructions(
                                    itemInput.getInstructions()
                            )

                            .build();

            prescription.getItems().add(item);
        }

        return prescriptionRepository.save(
                prescription
        );
    }
}