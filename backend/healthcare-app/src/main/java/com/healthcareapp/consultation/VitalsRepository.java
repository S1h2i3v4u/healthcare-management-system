package com.healthcareapp.consultation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VitalsRepository extends JpaRepository<Vitals, Long> {

    Optional<Vitals> findByConsultationId(Long consultationId);
}