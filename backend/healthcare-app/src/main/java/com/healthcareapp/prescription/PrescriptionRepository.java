package com.healthcareapp.prescription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByConsultationId(Long consultationId);

    // Walks Prescription -> Consultation -> Appointment -> PatientProfile
    // to find every prescription ever written for a given patient, across
    // all their appointments/doctors — powers §22's "My Prescriptions" list.
    // Ordered by the underlying appointment's date, most recent first,
    // matching the same "recent first" convention used everywhere else
    // patient-facing history is shown (§21).
    @Query("""
            SELECT p FROM Prescription p
            WHERE p.consultation.appointment.patientProfile.id = :patientProfileId
            ORDER BY p.consultation.appointment.appointmentDate DESC,
                     p.consultation.appointment.appointmentTime DESC
            """)
    List<Prescription> findAllForPatient(@Param("patientProfileId") Long patientProfileId);
}