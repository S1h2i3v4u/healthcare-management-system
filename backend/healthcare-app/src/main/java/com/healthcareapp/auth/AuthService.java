package com.healthcareapp.auth;

import com.healthcareapp.audit.AuditService;
import com.healthcareapp.auth.dto.AuthResponse;
import com.healthcareapp.auth.dto.LoginRequest;
import com.healthcareapp.auth.dto.RegisterDoctorRequest;
import com.healthcareapp.auth.dto.RegisterPatientRequest;
import com.healthcareapp.auth.enums.Role;
import com.healthcareapp.common.exceptions.ConflictException;
import com.healthcareapp.common.exceptions.UnauthorizedException;
import com.healthcareapp.doctor.DoctorProfile;
import com.healthcareapp.doctor.DoctorProfileRepository;
import com.healthcareapp.doctor.VerificationStatus;
import com.healthcareapp.patient.PatientProfile;
import com.healthcareapp.patient.PatientProfileRepository;
import com.healthcareapp.security.JwtService;
import com.healthcareapp.user.User;
import com.healthcareapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
    private final AuditService auditService;

    @Transactional
    public AuthResponse registerPatient(RegisterPatientRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ConflictException("Password and confirm password do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with this email already exists");
        }
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new ConflictException("An account with this mobile number already exists");
        }

        PatientProfile.Gender parsedGender;
        try {
            parsedGender = PatientProfile.Gender.valueOf(request.getGender().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ConflictException("Gender must be one of MALE, FEMALE, OTHER");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        PatientProfile profile = PatientProfile.builder()
                .user(savedUser)
                .dateOfBirth(request.getDateOfBirth())
                .gender(parsedGender)
                .bloodGroup(request.getBloodGroup())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactRelationship(request.getEmergencyContactRelationship())
                .emergencyContactMobile(request.getEmergencyContactMobile())
                .address(request.getAddress())
                .build();

        patientProfileRepository.save(profile);

        auditService.writeAuditLog(savedUser.getId(), "PATIENT", "PATIENT_REGISTERED",
                "User", savedUser.getId(), null);

        return buildAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse registerDoctor(RegisterDoctorRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ConflictException("Password and confirm password do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with this email already exists");
        }
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new ConflictException("An account with this mobile number already exists");
        }
        if (doctorProfileRepository.existsByMedicalRegistrationNumber(request.getMedicalRegistrationNumber())) {
            throw new ConflictException("A doctor with this medical registration number already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.DOCTOR)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        DoctorProfile profile = DoctorProfile.builder()
                .user(savedUser)
                .medicalRegistrationNumber(request.getMedicalRegistrationNumber())
                .medicalQualification(request.getMedicalQualification())
                .specialization(request.getSpecialization())
                .yearsOfExperience(request.getYearsOfExperience())
                .hospitalName(request.getHospitalName())
                .consultationFee(request.getConsultationFee())
                .city(request.getCity())
                .address(request.getAddress())
                .profilePhotoUrl(request.getProfilePhotoUrl())
                .professionalBio(request.getProfessionalBio())
                .verificationStatus(VerificationStatus.PENDING)
                .build();

        doctorProfileRepository.save(profile);

        auditService.writeAuditLog(savedUser.getId(), "DOCTOR", "DOCTOR_REGISTERED",
                "User", savedUser.getId(), "Pending verification");

        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been suspended. Contact support.");
        }

        auditService.writeAuditLog(user.getId(), user.getRole().name(), "LOGIN", null);

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}