package com.healthcareapp.hospital;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HospitalDoctorRepository extends JpaRepository<HospitalDoctor, Long> {

    List<HospitalDoctor> findByDoctorProfileId(Long doctorProfileId);

    boolean existsByHospitalIdAndDoctorProfileId(Long hospitalId, Long doctorProfileId);
}