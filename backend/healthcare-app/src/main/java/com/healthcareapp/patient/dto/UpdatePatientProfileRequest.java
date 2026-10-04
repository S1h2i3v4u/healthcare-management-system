package com.healthcareapp.patient.dto;

import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

// §20: "The patient can update their own profile information, but should
// not be able to modify finalized doctor consultation records." This DTO
// is scoped ONLY to the patient-owned fields — there is no path from this
// request to touching a Consultation, Diagnosis, or Prescription, by design.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientProfileRequest {

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String gender;
    private String bloodGroup;
    private String emergencyContactName;
    private String emergencyContactRelationship;
    private String emergencyContactMobile;
    private String address;

    // NOTE: fullName, email, mobileNumber live on User, not PatientProfile
    // — deliberately excluded here. Changing login-identity fields like
    // email deserves its own separate, more carefully-guarded flow (e.g.
    // re-verification) rather than being bundled into a general profile
    // edit form. Flagging as a future feature, not an oversight.
}