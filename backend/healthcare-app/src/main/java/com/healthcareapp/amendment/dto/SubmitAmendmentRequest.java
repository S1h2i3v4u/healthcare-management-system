package com.healthcareapp.amendment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAmendmentRequest {

    @NotBlank(message = "Reason for correction is required")
    private String reason;

    @NotBlank(message = "Proposed correction is required")
    private String proposedCorrection;
}