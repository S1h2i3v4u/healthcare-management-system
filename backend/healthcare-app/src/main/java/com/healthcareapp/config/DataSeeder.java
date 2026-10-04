package com.healthcareapp.config;

import com.healthcareapp.auth.enums.Role;
import com.healthcareapp.doctor.DoctorProfile;
import com.healthcareapp.doctor.DoctorProfileRepository;
import com.healthcareapp.doctor.VerificationStatus;
import com.healthcareapp.hospital.Hospital;
import com.healthcareapp.hospital.HospitalDoctor;
import com.healthcareapp.hospital.HospitalDoctorRepository;
import com.healthcareapp.hospital.HospitalRepository;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements org.springframework.boot.CommandLineRunner {

    private final UserRepository userRepository;

    private final DoctorProfileRepository doctorProfileRepository;

    private final HospitalRepository hospitalRepository;

    private final HospitalDoctorRepository hospitalDoctorRepository;

    private final PasswordEncoder passwordEncoder;

    private static final String DEMO_PASSWORD = "Demo@12345";

    private final Random random = new Random();


    // ============================================================
    // MAIN SEEDER
    // ============================================================

    @Override
    @Transactional
    public void run(String... args) {

        System.out.println("========================================");
        System.out.println("Starting development data seeding...");
        System.out.println("========================================");

        seedAdmin();

        seedHospitals();

        seedDoctors();

        /*
         * IMPORTANT:
         *
         * DoctorProfile.hospitalName is only a text field.
         * Actual doctor-hospital relationships are stored in
         * hospital_doctors.
         *
         * This method ensures those relationships exist even
         * for doctors created before this seeder was updated.
         */
        seedDoctorHospitalLinks();

        seedPatients();

        System.out.println("========================================");
        System.out.println("Development data seeding completed.");
        System.out.println("========================================");
    }


    // ============================================================
    // ADMIN
    // ============================================================

    /**
     * Creates the development admin account if it does not exist.
     *
     * If the account already exists, its password is reset to the
     * known development password so that the admin login always
     * works in dev.
     */
    private void seedAdmin() {

        User admin = userRepository
                .findByEmail("admin@healthcareapp.com")
                .orElse(null);

        if (admin == null) {

            admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@healthcareapp.com")
                    .mobileNumber("9999999999")
                    .passwordHash(
                            passwordEncoder.encode(DEMO_PASSWORD)
                    )
                    .role(Role.ADMIN)
                    .active(true)
                    .build();

        } else {

            /*
             * DEV ONLY:
             *
             * Always ensure the demo admin has a known
             * development password and correct role/status.
             */
            admin.setFullName("System Admin");

            admin.setPasswordHash(
                    passwordEncoder.encode(DEMO_PASSWORD)
            );

            admin.setRole(Role.ADMIN);

            admin.setActive(true);
        }

        userRepository.save(admin);

        System.out.println("----------------------------------------");
        System.out.println("DEV ADMIN");
        System.out.println("Email    : admin@healthcareapp.com");
        System.out.println("Password : " + DEMO_PASSWORD);
        System.out.println("----------------------------------------");
    }


    // ============================================================
    // HOSPITALS
    // ============================================================

    /**
     * Creates demo hospitals.
     */
    private void seedHospitals() {

        if (hospitalRepository.count() > 0) {

            System.out.println(
                    "Hospitals already exist. Skipping hospital seed."
            );

            return;
        }

        List<Hospital> hospitals = List.of(

                Hospital.builder()
                        .name("Ruby Hall Clinic")
                        .address("Sassoon Road")
                        .city("Pune")
                        .state("Maharashtra")
                        .pincode("411001")
                        .phone("02066455100")
                        .email("info@rubyhall.com")
                        .specialties(
                                "Cardiology,Neurology,Orthopedics,General Medicine"
                        )
                        .build(),

                Hospital.builder()
                        .name("Jehangir Hospital")
                        .address("32 Sassoon Road")
                        .city("Pune")
                        .state("Maharashtra")
                        .pincode("411001")
                        .phone("02066819999")
                        .email("info@jehangirhospital.com")
                        .specialties(
                                "Cardiology,Neurology,Oncology,Orthopedics"
                        )
                        .build(),

                Hospital.builder()
                        .name("Deenanath Mangeshkar Hospital")
                        .address("Erandwane")
                        .city("Pune")
                        .state("Maharashtra")
                        .pincode("411004")
                        .phone("02040151000")
                        .email("info@dmhospital.org")
                        .specialties(
                                "Cardiology,Neurology,Pediatrics,General Medicine"
                        )
                        .build(),

                Hospital.builder()
                        .name("Sancheti Hospital")
                        .address("Shivajinagar")
                        .city("Pune")
                        .state("Maharashtra")
                        .pincode("411005")
                        .phone("02028999100")
                        .email("info@sanchetihospital.org")
                        .specialties(
                                "Orthopedics,Joint Replacement,Spine Surgery"
                        )
                        .build()
        );

        hospitalRepository.saveAll(hospitals);

        System.out.println(
                "Created " + hospitals.size() + " demo hospitals."
        );
    }


    // ============================================================
    // DOCTORS
    // ============================================================

    /**
     * Creates demo verified doctors.
     */
    private void seedDoctors() {

        if (doctorProfileRepository.count() > 0) {

            System.out.println(
                    "Doctors already exist. Skipping doctor seed."
            );

            return;
        }

        Hospital rubyHall = findHospital(
                "Ruby Hall Clinic"
        );

        Hospital jehangir = findHospital(
                "Jehangir Hospital"
        );

        Hospital deenanath = findHospital(
                "Deenanath Mangeshkar Hospital"
        );

        Hospital sancheti = findHospital(
                "Sancheti Hospital"
        );


        String[] firstNames = {
                "Amit",
                "Rahul",
                "Priya",
                "Neha",
                "Sneha",
                "Rohan",
                "Pooja",
                "Anjali",
                "Vikram",
                "Kiran"
        };

        String[] lastNames = {
                "Sharma",
                "Patil",
                "Kulkarni",
                "Deshmukh",
                "Joshi",
                "More",
                "Jadhav",
                "Pawar",
                "Chavan",
                "Kale"
        };

        String[] specializations = {
                "Cardiology",
                "Dermatology",
                "Neurology",
                "Orthopedics",
                "Pediatrics",
                "General Medicine",
                "Gynecology",
                "ENT",
                "Ophthalmology",
                "Psychiatry"
        };


        for (int i = 0; i < 30; i++) {

            String firstName =
                    firstNames[i % firstNames.length];

            String lastName =
                    lastNames[i % lastNames.length];

            String fullName =
                    "Dr. " + firstName + " " + lastName;

            String email =
                    "doctor" + (i + 1)
                            + "@healthcareapp.com";


            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .mobileNumber(
                            "98"
                                    + String.format(
                                            "%08d",
                                            i + 1
                                    )
                    )
                    .passwordHash(
                            passwordEncoder.encode(
                                    DEMO_PASSWORD
                            )
                    )
                    .role(Role.DOCTOR)
                    .active(true)
                    .build();

            userRepository.save(user);


            Hospital hospital;

            int hospitalIndex = i % 4;

            if (hospitalIndex == 0) {

                hospital = rubyHall;

            } else if (hospitalIndex == 1) {

                hospital = jehangir;

            } else if (hospitalIndex == 2) {

                hospital = deenanath;

            } else {

                hospital = sancheti;
            }


            DoctorProfile doctor =
                    DoctorProfile.builder()
                            .user(user)
                            .medicalRegistrationNumber(
                                    "MCI-"
                                            + String.format(
                                                    "%05d",
                                                    i + 1
                                            )
                            )
                            .medicalQualification(
                                    "MBBS, MD"
                            )
                            .specialization(
                                    specializations[
                                            i % specializations.length
                                    ]
                            )
                            .yearsOfExperience(
                                    3 + random.nextInt(18)
                            )
                            .hospitalName(
                                    hospital != null
                                            ? hospital.getName()
                                            : "Pune Hospital"
                            )
                            .consultationFee(
                                    BigDecimal.valueOf(
                                            500
                                                    + (
                                                    random.nextInt(6)
                                                            * 100L
                                            )
                                    )
                            )
                            .city("Pune")
                            .address(
                                    hospital != null
                                            ? hospital.getAddress()
                                            : "Pune"
                            )
                            .professionalBio(
                                    "Experienced medical professional "
                                            + "providing patient-focused "
                                            + "healthcare and consultation."
                            )
                            .verificationStatus(
                                    VerificationStatus.VERIFIED
                            )
                            .build();


            DoctorProfile savedDoctor =
                    doctorProfileRepository.save(
                            doctor
                    );


            /*
             * IMPORTANT:
             *
             * hospitalName above is only a text field.
             *
             * We also create the actual HospitalDoctor
             * relationship.
             */
            if (hospital != null) {

                createHospitalLinkIfMissing(
                        savedDoctor,
                        hospital
                );
            }
        }


        System.out.println(
                "Created 30 demo verified doctors."
        );
    }


    // ============================================================
    // REPAIR / ENSURE DOCTOR-HOSPITAL LINKS
    // ============================================================

    /**
     * Ensures every existing verified doctor has an actual
     * HospitalDoctor relationship.
     *
     * This is particularly important for doctors that already
     * existed in the database before the hospital relationship
     * seeding was added.
     */
    private void seedDoctorHospitalLinks() {

        List<DoctorProfile> doctors =
                doctorProfileRepository.findAll();

        if (doctors.isEmpty()) {

            System.out.println(
                    "No doctors found for hospital linking."
            );

            return;
        }


        List<Hospital> hospitals =
                hospitalRepository.findAll();


        if (hospitals.isEmpty()) {

            System.out.println(
                    "No hospitals available for doctor linking."
            );

            return;
        }


        int createdLinks = 0;


        for (DoctorProfile doctor : doctors) {

            /*
             * If the doctor already has at least one hospital
             * relationship, nothing needs to be done.
             */
            if (!hospitalDoctorRepository
                    .findByDoctorProfileId(
                            doctor.getId()
                    )
                    .isEmpty()) {

                continue;
            }


            Hospital hospital = null;


            // ----------------------------------------------------
            // First preference:
            // Match DoctorProfile.hospitalName
            // ----------------------------------------------------

            if (doctor.getHospitalName() != null
                    && !doctor.getHospitalName().isBlank()) {

                String hospitalName =
                        doctor.getHospitalName()
                                .trim();

                hospital =
                        hospitals.stream()
                                .filter(h ->
                                        h.getName()
                                                .equalsIgnoreCase(
                                                        hospitalName
                                                )
                                )
                                .findFirst()
                                .orElse(null);
            }


            // ----------------------------------------------------
            // Second preference:
            // Match hospital city with doctor city
            // ----------------------------------------------------

            if (hospital == null
                    && doctor.getCity() != null
                    && !doctor.getCity().isBlank()) {

                String doctorCity =
                        doctor.getCity()
                                .trim();

                hospital =
                        hospitals.stream()
                                .filter(h ->
                                        h.getCity() != null
                                                && h.getCity()
                                                        .equalsIgnoreCase(
                                                                doctorCity
                                                        )
                                )
                                .findFirst()
                                .orElse(null);
            }


            // ----------------------------------------------------
            // Development fallback
            // ----------------------------------------------------

            /*
             * A doctor may have been registered without a
             * hospital because hospitalName is optional during
             * doctor registration.
             *
             * For DEV mode we still need a valid hospital
             * relationship so that the appointment booking
             * flow can be tested.
             *
             * Ruby Hall Clinic is used as the development
             * fallback.
             */
            if (hospital == null) {

                hospital =
                        hospitals.stream()
                                .filter(h ->
                                        h.getName()
                                                .equalsIgnoreCase(
                                                        "Ruby Hall Clinic"
                                                )
                                )
                                .findFirst()
                                .orElse(
                                        hospitals.get(0)
                                );
            }


            createHospitalLinkIfMissing(
                    doctor,
                    hospital
            );

            createdLinks++;
        }


        System.out.println(
                "Created "
                        + createdLinks
                        + " missing doctor-hospital links."
        );
    }


    // ============================================================
    // CREATE HOSPITAL LINK
    // ============================================================

    /**
     * Creates a HospitalDoctor relationship only if it does
     * not already exist.
     */
    private void createHospitalLinkIfMissing(
            DoctorProfile doctor,
            Hospital hospital) {

        if (doctor == null || hospital == null) {
            return;
        }


        boolean exists =
                hospitalDoctorRepository
                        .existsByHospitalIdAndDoctorProfileId(
                                hospital.getId(),
                                doctor.getId()
                        );


        if (exists) {

            return;
        }


        HospitalDoctor link =
                HospitalDoctor.builder()
                        .hospital(hospital)
                        .doctorProfile(doctor)
                        .build();


        hospitalDoctorRepository.save(link);


        System.out.println(
                "Linked doctor ID "
                        + doctor.getId()
                        + " -> "
                        + hospital.getName()
        );
    }


    // ============================================================
    // FIND HOSPITAL
    // ============================================================

    private Hospital findHospital(
            String name) {

        return hospitalRepository
                .findAll()
                .stream()
                .filter(h ->
                        h.getName()
                                .equalsIgnoreCase(name)
                )
                .findFirst()
                .orElse(null);
    }


    // ============================================================
    // PATIENTS
    // ============================================================

    /**
     * Creates demo patients.
     */
    private void seedPatients() {

        long patientCount =
                userRepository.countByRole(
                        Role.PATIENT
                );


        if (patientCount > 0) {

            System.out.println(
                    "Patients already exist. Skipping patient seed."
            );

            return;
        }


        for (int i = 0; i < 20; i++) {

            User patient =
                    User.builder()
                            .fullName(
                                    "Demo Patient "
                                            + (i + 1)
                            )
                            .email(
                                    "patient"
                                            + (i + 1)
                                            + "@healthcareapp.com"
                            )
                            .mobileNumber(
                                    "97"
                                            + String.format(
                                                    "%08d",
                                                    i + 1
                                            )
                            )
                            .passwordHash(
                                    passwordEncoder.encode(
                                            DEMO_PASSWORD
                                    )
                            )
                            .role(Role.PATIENT)
                            .active(true)
                            .build();


            userRepository.save(patient);
        }


        System.out.println(
                "Created 20 demo patients."
        );
    }
}