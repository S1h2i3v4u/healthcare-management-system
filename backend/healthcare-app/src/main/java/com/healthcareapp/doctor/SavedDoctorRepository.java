package com.healthcareapp.doctor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedDoctorRepository extends JpaRepository<SavedDoctor, Long> {

    List<SavedDoctor> findByPatientIdOrderByCreatedAtDesc(Long patientUserId);

    Optional<SavedDoctor> findByPatientIdAndDoctorProfileId(Long patientUserId, Long doctorProfileId);

    boolean existsByPatientIdAndDoctorProfileId(Long patientUserId, Long doctorProfileId);
}