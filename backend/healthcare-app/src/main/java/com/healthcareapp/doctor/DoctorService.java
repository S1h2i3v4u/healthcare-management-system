package com.healthcareapp.doctor;

import java.time.LocalDate;
import java.time.Period;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcareapp.appointment.Appointment;
import com.healthcareapp.appointment.AppointmentRepository;
import com.healthcareapp.appointment.AppointmentStatus;
import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.doctor.dto.CreateAvailabilityRequest;
import com.healthcareapp.doctor.dto.DoctorAvailabilityResponse;
import com.healthcareapp.doctor.dto.DoctorResponse;
import com.healthcareapp.doctor.dto.DoctorSearchFilter;
import com.healthcareapp.doctor.dto.PatientListItemResponse;
import com.healthcareapp.doctor.dto.SpecializationCountResponse;
import com.healthcareapp.doctor.dto.UpdateDoctorProfileRequest;
import com.healthcareapp.hospital.Hospital;
import com.healthcareapp.hospital.HospitalDoctor;
import com.healthcareapp.hospital.HospitalDoctorRepository;
import com.healthcareapp.hospital.HospitalRepository;
import com.healthcareapp.patient.PatientProfile;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;

    private final HospitalRepository hospitalRepository;

    private final HospitalDoctorRepository hospitalDoctorRepository;

    // ============================================================
    // APPOINTMENTS / MY PATIENTS
    // ============================================================

    private final AppointmentRepository appointmentRepository;

    // ============================================================
    // SCHEDULE MANAGEMENT
    // ============================================================

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

    // ============================================================
    // SAVED DOCTORS
    // ============================================================

    private final SavedDoctorRepository savedDoctorRepository;

    private final UserRepository userRepository;

    // ============================================================
    // SEARCH DOCTORS
    // ============================================================

    public Page<DoctorResponse> searchDoctors(
            DoctorSearchFilter filter,
            Pageable pageable) {

        Page<DoctorProfile> results =
                doctorProfileRepository.searchDoctors(
                        filter.getName(),
                        filter.getSpecialization(),
                        filter.getCity(),
                        filter.getMinExperience(),
                        filter.getMaxFee(),
                        pageable
                );

        /*
         * Hospital-name filter is applied after the repository query
         * because hospital information is stored through HospitalDoctor.
         */
        List<DoctorProfile> filtered = results.getContent();

        if (filter.getHospital() != null
                && !filter.getHospital().isBlank()) {

            filtered = filtered.stream()
                    .filter(doctor ->
                            getHospitalNames(doctor.getId())
                                    .stream()
                                    .anyMatch(name ->
                                            name.toLowerCase()
                                                    .contains(
                                                            filter.getHospital()
                                                                    .toLowerCase()
                                                    )
                                    )
                    )
                    .collect(Collectors.toList());
        }

        List<DoctorResponse> responses =
                filtered.stream()
                        .map(doctor ->
                                DoctorResponse.fromEntity(
                                        doctor,
                                        getHospitalNames(doctor.getId()),
                                        getHospitalIds(doctor.getId())
                                )
                        )
                        .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(
                responses,
                pageable,
                results.getTotalElements()
        );
    }

    // ============================================================
    // GET DOCTOR BY ID
    // ============================================================

    public DoctorResponse getDoctorById(
            Long doctorProfileId) {

        DoctorProfile doctor =
                doctorProfileRepository.findById(doctorProfileId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor not found"
                                )
                        );

        return DoctorResponse.fromEntity(
                doctor,
                getHospitalNames(doctor.getId()),
                getHospitalIds(doctor.getId())
        );
    }

    // ============================================================
    // DOCTOR'S OWN PROFILE
    // ============================================================

    /**
     * Get the profile of the currently logged-in doctor.
     */
    public DoctorResponse getMyProfile(
            Long doctorUserId) {

        DoctorProfile doctor =
                doctorProfileRepository.findByUserId(doctorUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor profile not found"
                                )
                        );

        return DoctorResponse.fromEntity(
                doctor,
                getHospitalNames(doctor.getId()),
                getHospitalIds(doctor.getId())
        );
    }

    /**
     * Update the profile of the currently logged-in doctor.
     *
     * Only non-null fields supplied by the request are updated.
     */
    @Transactional
    public DoctorResponse updateMyProfile(
            Long doctorUserId,
            UpdateDoctorProfileRequest request) {

        DoctorProfile doctor =
                doctorProfileRepository.findByUserId(doctorUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor profile not found"
                                )
                        );

        if (request.getMedicalQualification() != null) {
            doctor.setMedicalQualification(
                    request.getMedicalQualification()
            );
        }

        if (request.getSpecialization() != null) {
            doctor.setSpecialization(
                    request.getSpecialization()
            );
        }

        if (request.getYearsOfExperience() != null) {
            doctor.setYearsOfExperience(
                    request.getYearsOfExperience()
            );
        }

        if (request.getConsultationFee() != null) {
            doctor.setConsultationFee(
                    request.getConsultationFee()
            );
        }

        if (request.getCity() != null) {
            doctor.setCity(
                    request.getCity()
            );
        }

        if (request.getAddress() != null) {
            doctor.setAddress(
                    request.getAddress()
            );
        }

        if (request.getProfilePhotoUrl() != null) {
            doctor.setProfilePhotoUrl(
                    request.getProfilePhotoUrl()
            );
        }

        if (request.getProfessionalBio() != null) {
            doctor.setProfessionalBio(
                    request.getProfessionalBio()
            );
        }

        DoctorProfile updated =
                doctorProfileRepository.save(doctor);

        return DoctorResponse.fromEntity(
                updated,
                getHospitalNames(updated.getId()),
                getHospitalIds(updated.getId())
        );
    }

    // ============================================================
    // SAVED DOCTORS
    // ============================================================

    /**
     * Save a doctor for the currently logged-in patient.
     *
     * The operation is idempotent:
     * saving an already-saved doctor does nothing.
     */
    @Transactional
    public void saveDoctor(
            Long patientUserId,
            Long doctorProfileId) {

        if (savedDoctorRepository
                .existsByPatientIdAndDoctorProfileId(
                        patientUserId,
                        doctorProfileId
                )) {

            return;
        }

        DoctorProfile doctor =
                doctorProfileRepository.findById(
                        doctorProfileId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"
                        )
                );

        User patient =
                userRepository.findById(
                        patientUserId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        SavedDoctor saved =
                SavedDoctor.builder()
                        .patient(patient)
                        .doctorProfile(doctor)
                        .build();

        savedDoctorRepository.save(saved);
    }

    /**
     * Remove a doctor from the patient's saved doctors.
     *
     * If the doctor is not saved, nothing happens.
     */
    @Transactional
    public void unsaveDoctor(
            Long patientUserId,
            Long doctorProfileId) {

        savedDoctorRepository
                .findByPatientIdAndDoctorProfileId(
                        patientUserId,
                        doctorProfileId
                )
                .ifPresent(
                        savedDoctorRepository::delete
                );
    }

    /**
     * Get all doctors saved by the currently logged-in patient.
     *
     * Most recently saved doctors appear first.
     */
    public List<DoctorResponse> getSavedDoctors(
            Long patientUserId) {

        return savedDoctorRepository
                .findByPatientIdOrderByCreatedAtDesc(
                        patientUserId
                )
                .stream()
                .map(savedDoctor ->
                        DoctorResponse.fromEntity(
                                savedDoctor.getDoctorProfile(),
                                getHospitalNames(
                                        savedDoctor
                                                .getDoctorProfile()
                                                .getId()
                                ),
                                getHospitalIds(
                                        savedDoctor
                                                .getDoctorProfile()
                                                .getId()
                                )
                        )
                )
                .map(response ->
                        DoctorResponse.withSavedFlag(
                                response,
                                true
                        )
                )
                .collect(Collectors.toList());
    }

    /**
     * Check whether a particular doctor has been saved
     * by the specified patient.
     */
    public boolean isDoctorSavedByPatient(
            Long patientUserId,
            Long doctorProfileId) {

        return savedDoctorRepository
                .existsByPatientIdAndDoctorProfileId(
                        patientUserId,
                        doctorProfileId
                );
    }

    // ============================================================
    // FIND DOCTORS - AVAILABLE CITIES
    // ============================================================

    /**
     * Returns cities that have at least one verified doctor.
     */
    public List<String> getAvailableCities() {

        return doctorProfileRepository
                .findDistinctCities();
    }

    // ============================================================
    // FIND DOCTORS - SPECIALIZATIONS BY CITY
    // ============================================================

    /**
     * Returns specializations available in the selected city,
     * together with the number of verified doctors.
     */
    public List<SpecializationCountResponse>
    getSpecializationsForCity(
            String city) {

        return doctorProfileRepository
                .findSpecializationCountsByCity(city)
                .stream()
                .map(projection ->
                        SpecializationCountResponse.builder()
                                .specialization(
                                        projection.getSpecialization()
                                )
                                .doctorCount(
                                        projection.getDoctorCount()
                                )
                                .build()
                )
                .collect(Collectors.toList());
    }

    // ============================================================
    // SCHEDULE MANAGEMENT
    // ============================================================

    /**
     * Add a new weekly availability rule for the logged-in doctor.
     */
    @Transactional
    public DoctorAvailabilityResponse addAvailability(
            Long doctorUserId,
            CreateAvailabilityRequest request) {

        DoctorProfile doctor =
                doctorProfileRepository.findByUserId(doctorUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor profile not found"
                                )
                        );

        // --------------------------------------------------------
        // Validate working hours
        // --------------------------------------------------------

        if (!request.getEndTime()
                .isAfter(request.getStartTime())) {

            throw new ConflictException(
                    "End time must be after start time"
            );
        }

        // --------------------------------------------------------
        // Validate slot duration
        // --------------------------------------------------------

        if (request.getSlotDurationMinutes() == null
                || request.getSlotDurationMinutes() <= 0) {

            throw new ConflictException(
                    "Slot duration must be greater than zero"
            );
        }

        // --------------------------------------------------------
        // Validate break
        // --------------------------------------------------------

        if (request.getBreakStartTime() != null
                || request.getBreakEndTime() != null) {

            if (request.getBreakStartTime() == null
                    || request.getBreakEndTime() == null) {

                throw new ConflictException(
                        "Both break start time and break end time are required"
                );
            }

            if (!request.getBreakEndTime()
                    .isAfter(request.getBreakStartTime())) {

                throw new ConflictException(
                        "Break end time must be after break start time"
                );
            }

            // Break must be inside working hours.

            if (request.getBreakStartTime()
                    .isBefore(request.getStartTime())
                    || request.getBreakEndTime()
                            .isAfter(request.getEndTime())) {

                throw new ConflictException(
                        "Break must be inside the working period"
                );
            }
        }

        // --------------------------------------------------------
        // Create availability
        // --------------------------------------------------------

        DoctorAvailability availability =
                DoctorAvailability.builder()
                        .doctorProfile(doctor)
                        .dayOfWeek(
                                request.getDayOfWeek()
                        )
                        .startTime(
                                request.getStartTime()
                        )
                        .endTime(
                                request.getEndTime()
                        )
                        .slotDurationMinutes(
                                request.getSlotDurationMinutes()
                        )
                        .breakStartTime(
                                request.getBreakStartTime()
                        )
                        .breakEndTime(
                                request.getBreakEndTime()
                        )
                        .active(true)
                        .build();

        DoctorAvailability saved =
                doctorAvailabilityRepository.save(
                        availability
                );

        return DoctorAvailabilityResponse
                .fromEntity(saved);
    }

    /**
     * Get all availability rules belonging
     * to the currently logged-in doctor.
     */
    public List<DoctorAvailabilityResponse> getMyAvailability(
            Long doctorUserId) {

        DoctorProfile doctor =
                doctorProfileRepository.findByUserId(doctorUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor profile not found"
                                )
                        );

        return doctorAvailabilityRepository
                .findByDoctorProfileIdOrderByDayOfWeekAscStartTimeAsc(
                        doctor.getId()
                )
                .stream()
                .map(
                        DoctorAvailabilityResponse::fromEntity
                )
                .collect(Collectors.toList());
    }

    /**
     * Delete an availability rule.
     *
     * Ownership is checked before deletion so that
     * one doctor cannot delete another doctor's schedule.
     */
    @Transactional
    public void deleteAvailability(
            Long availabilityId,
            Long doctorUserId) {

        DoctorProfile doctor =
                doctorProfileRepository.findByUserId(doctorUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor profile not found"
                                )
                        );

        boolean belongsToDoctor =
                doctorAvailabilityRepository
                        .existsByIdAndDoctorProfileId(
                                availabilityId,
                                doctor.getId()
                        );

        if (!belongsToDoctor) {

            throw new ResourceNotFoundException(
                    "Availability rule not found"
            );
        }

        doctorAvailabilityRepository.deleteById(
                availabilityId
        );
    }

    // ============================================================
    // LINK DOCTOR TO HOSPITAL
    // ============================================================

    @Transactional
    public void linkDoctorToHospital(
            Long doctorProfileId,
            Long hospitalId) {

        DoctorProfile doctor =
                doctorProfileRepository.findById(
                        doctorProfileId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found"
                        )
                );

        if (doctor.getVerificationStatus()
                != VerificationStatus.VERIFIED) {

            throw new ConflictException(
                    "Only verified doctors can link themselves to a hospital"
            );
        }

        Hospital hospital =
                hospitalRepository.findById(
                        hospitalId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hospital not found"
                        )
                );

        if (hospitalDoctorRepository
                .existsByHospitalIdAndDoctorProfileId(
                        hospitalId,
                        doctorProfileId
                )) {

            throw new ConflictException(
                    "Doctor is already linked to this hospital"
            );
        }

        HospitalDoctor link =
                HospitalDoctor.builder()
                        .hospital(hospital)
                        .doctorProfile(doctor)
                        .build();

        hospitalDoctorRepository.save(link);
    }

    // ============================================================
    // MY PATIENTS
    // ============================================================

    /**
     * Returns distinct patients who have had
     * at least one appointment with the logged-in doctor.
     *
     * One patient appears only once even if they have
     * multiple appointments.
     */
    public List<PatientListItemResponse> getMyPatients(
            Long doctorUserId) {

        DoctorProfile doctor =
                doctorProfileRepository.findByUserId(
                        doctorUserId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found"
                        )
                );

        List<Appointment> allAppointments =
                appointmentRepository
                        .findByDoctorProfileIdOrderByAppointmentDateDescAppointmentTimeDesc(
                                doctor.getId()
                        );

        /*
         * Group appointments by patient profile.
         */
        Map<Long, List<Appointment>> byPatient =
                allAppointments.stream()
                        .collect(
                                Collectors.groupingBy(
                                        appointment ->
                                                appointment
                                                        .getPatientProfile()
                                                        .getId()
                                )
                        );

        LocalDate today =
                LocalDate.now();

        return byPatient.values()
                .stream()
                .map(patientAppointments -> {

                    PatientProfile patient =
                            patientAppointments
                                    .get(0)
                                    .getPatientProfile();

                    // ------------------------------------------------
                    // Last appointment
                    // ------------------------------------------------

                    Optional<LocalDate> last =
                            patientAppointments
                                    .stream()
                                    .filter(appointment ->
                                            appointment
                                                    .getAppointmentDate()
                                                    .isBefore(today)
                                            ||
                                            appointment
                                                    .getAppointmentDate()
                                                    .isEqual(today)
                                    )
                                    .map(
                                            Appointment::getAppointmentDate
                                    )
                                    .max(
                                            LocalDate::compareTo
                                    );

                    // ------------------------------------------------
                    // Next appointment
                    // ------------------------------------------------

                    Optional<LocalDate> next =
                            patientAppointments
                                    .stream()
                                    .filter(appointment ->
                                            appointment
                                                    .getAppointmentDate()
                                                    .isAfter(today)
                                            &&
                                            (
                                                appointment
                                                        .getStatus()
                                                        == AppointmentStatus.BOOKED
                                                ||
                                                appointment
                                                        .getStatus()
                                                        == AppointmentStatus.CONFIRMED
                                            )
                                    )
                                    .map(
                                            Appointment::getAppointmentDate
                                    )
                                    .min(
                                            LocalDate::compareTo
                                    );

                    // ------------------------------------------------
                    // Calculate current age
                    // ------------------------------------------------

                    Integer age =
                            patient.getDateOfBirth() != null
                                    ? Period.between(
                                            patient.getDateOfBirth(),
                                            today
                                    ).getYears()
                                    : null;

                    // ------------------------------------------------
                    // Build response
                    // ------------------------------------------------

                    return PatientListItemResponse
                            .builder()
                            .patientProfileId(
                                    patient.getId()
                            )
                            .fullName(
                                    patient.getUser()
                                            .getFullName()
                            )
                            .age(age)
                            .gender(
                                    patient.getGender() != null
                                            ? patient
                                                    .getGender()
                                                    .name()
                                            : null
                            )
                            .lastAppointmentDate(
                                    last.orElse(null)
                            )
                            .nextAppointmentDate(
                                    next.orElse(null)
                            )
                            .build();
                })
                .sorted(
                        Comparator.comparing(
                                PatientListItemResponse
                                        ::getFullName
                        )
                )
                .collect(
                        Collectors.toList()
                );
    }

    // ============================================================
    // HOSPITAL HELPERS
    // ============================================================

    private List<String> getHospitalNames(
            Long doctorProfileId) {

        return hospitalDoctorRepository
                .findByDoctorProfileId(
                        doctorProfileId
                )
                .stream()
                .map(
                        hd ->
                                hd.getHospital()
                                        .getName()
                )
                .collect(
                        Collectors.toList()
                );
    }

    private List<Long> getHospitalIds(
            Long doctorProfileId) {

        return hospitalDoctorRepository
                .findByDoctorProfileId(
                        doctorProfileId
                )
                .stream()
                .map(
                        hd ->
                                hd.getHospital()
                                        .getId()
                )
                .collect(
                        Collectors.toList()
                );
    }
}