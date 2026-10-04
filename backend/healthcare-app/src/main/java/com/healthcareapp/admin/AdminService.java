package com.healthcareapp.admin;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcareapp.admin.dto.AdminDashboardResponse;
import com.healthcareapp.admin.dto.AdminDoctorListResponse;
import com.healthcareapp.admin.dto.AdminPatientListResponse;
import com.healthcareapp.appointment.AppointmentRepository;
import com.healthcareapp.appointment.AppointmentStatus;
import com.healthcareapp.appointment.dto.AppointmentResponse;
import com.healthcareapp.audit.AuditService;
import com.healthcareapp.auth.enums.Role;
import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.doctor.DoctorProfile;
import com.healthcareapp.doctor.DoctorProfileRepository;
import com.healthcareapp.doctor.VerificationStatus;
import com.healthcareapp.hospital.Hospital;
import com.healthcareapp.hospital.HospitalRepository;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditService auditService;

    // =========================================================
    // DOCTOR VERIFICATION
    // =========================================================

    @Transactional
    public void verifyDoctor(
            Long doctorProfileId,
            Long adminUserId) {

        DoctorProfile doctor = doctorProfileRepository
                .findById(doctorProfileId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"));

        if (doctor.getVerificationStatus()
                == VerificationStatus.VERIFIED) {

            throw new ConflictException(
                    "Doctor is already verified");
        }

        doctor.setVerificationStatus(
                VerificationStatus.VERIFIED);

        doctorProfileRepository.save(doctor);

        auditService.writeAuditLog(
                adminUserId,
                "ADMIN",
                "DOCTOR_VERIFIED",
                "DoctorProfile",
                doctorProfileId,
                null
        );
    }

    // =========================================================
    // DOCTOR REJECTION
    // =========================================================

    @Transactional
    public void rejectDoctor(
            Long doctorProfileId,
            Long adminUserId) {

        DoctorProfile doctor = doctorProfileRepository
                .findById(doctorProfileId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"));

        doctor.setVerificationStatus(
                VerificationStatus.REJECTED);

        doctorProfileRepository.save(doctor);

        auditService.writeAuditLog(
                adminUserId,
                "ADMIN",
                "DOCTOR_REJECTED",
                "DoctorProfile",
                doctorProfileId,
                null
        );
    }

    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    public AdminDashboardResponse getDashboard() {

        return AdminDashboardResponse.builder()

                .totalPatients(
                        userRepository.countByRole(
                                Role.PATIENT)
                )

                .totalDoctors(
                        userRepository.countByRole(
                                Role.DOCTOR)
                )

                .pendingDoctorVerifications(
                        doctorProfileRepository
                                .countByVerificationStatus(
                                        VerificationStatus.PENDING)
                )

                .verifiedDoctors(
                        doctorProfileRepository
                                .countByVerificationStatus(
                                        VerificationStatus.VERIFIED)
                )

                .totalHospitals(
                        hospitalRepository.countByStatus(
                                Hospital.HospitalStatus.ACTIVE)
                )

                .totalAppointments(
                        appointmentRepository.count()
                )

                .todaysAppointments(
                        appointmentRepository
                                .countByAppointmentDate(
                                        LocalDate.now())
                )

                .completedAppointments(
                        appointmentRepository.countByStatus(
                                AppointmentStatus.COMPLETED)
                )

                .cancelledAppointments(
                        appointmentRepository.countByStatus(
                                AppointmentStatus.CANCELLED)
                )

                .build();
    }

    // =========================================================
    // MANAGE DOCTORS
    // =========================================================

    public Page<AdminDoctorListResponse> getDoctorsForAdmin(
            VerificationStatus status,
            Pageable pageable) {

        return doctorProfileRepository
                .findAllForAdmin(status, pageable)
                .map(AdminDoctorListResponse::fromEntity);
    }

    // =========================================================
    // MANAGE PATIENTS
    // =========================================================

    public Page<AdminPatientListResponse> getPatients(
            String search,
            Pageable pageable) {

        return userRepository
                .searchPatients(search, pageable)
                .map(AdminPatientListResponse::fromEntity);
    }

    // =========================================================
    // SUSPEND PATIENT
    // =========================================================

    @Transactional
    public void suspendPatient(
            Long patientUserId,
            Long adminUserId) {

        User user = userRepository
                .findById(patientUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"));

        if (user.getRole() != Role.PATIENT) {
            throw new ConflictException(
                    "This account is not a patient account");
        }

        if (!user.isActive()) {
            throw new ConflictException(
                    "This account is already suspended");
        }

        user.setActive(false);

        userRepository.save(user);

        auditService.writeAuditLog(
                adminUserId,
                "ADMIN",
                "PATIENT_SUSPENDED",
                "User",
                patientUserId,
                null
        );
    }

    // =========================================================
    // ACTIVATE PATIENT
    // =========================================================

    @Transactional
    public void activatePatient(
            Long patientUserId,
            Long adminUserId) {

        User user = userRepository
                .findById(patientUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"));

        if (user.getRole() != Role.PATIENT) {
            throw new ConflictException(
                    "This account is not a patient account");
        }

        if (user.isActive()) {
            throw new ConflictException(
                    "This account is already active");
        }

        user.setActive(true);

        userRepository.save(user);

        auditService.writeAuditLog(
                adminUserId,
                "ADMIN",
                "PATIENT_ACTIVATED",
                "User",
                patientUserId,
                null
        );
    }

    // =========================================================
    // MANAGE APPOINTMENTS
    // =========================================================
    //
    // Read-only admin oversight.
    //
    // Admin can filter appointments by:
    // - Doctor
    // - Hospital
    // - Status
    // - Date
    //
    // Admin does NOT cancel or modify appointments here.
    // Patient/doctor ownership rules remain unchanged.
    // =========================================================

    public Page<AppointmentResponse> getAppointmentsForAdmin(
            Long doctorProfileId,
            Long hospitalId,
            AppointmentStatus status,
            LocalDate date,
            Pageable pageable) {

        return appointmentRepository
                .searchAppointmentsForAdmin(
                        doctorProfileId,
                        hospitalId,
                        status,
                        date,
                        pageable
                )
                .map(AppointmentResponse::fromEntity);
    }
}