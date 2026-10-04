package com.healthcareapp.amendment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewAmendmentRequest {

    private boolean approved; // true = APPROVED, false = REJECTED

    private String reviewNotes; // optional, especially useful on rejection
}