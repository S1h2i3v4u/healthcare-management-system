package com.healthcareapp.doctor.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DoctorSearchFilter {

    private String name;
    private String specialization;
    private String city;
    private Integer minExperience;
    private BigDecimal maxFee;
    private String hospital;
}