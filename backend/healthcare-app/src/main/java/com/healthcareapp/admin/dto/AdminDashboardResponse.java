package com.healthcareapp.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// §6 + §46: the admin dashboard's summary cards. Every field here maps to
// one existing count* repository method — this feature is almost entirely
// assembly, not new logic, because we deliberately added these counts
// while building Users/Doctors/Hospitals/Appointments rather than
// retrofitting them now.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalPatients;
    private long totalDoctors;
    private long pendingDoctorVerifications;
    private long verifiedDoctors;
    private long totalHospitals;
    private long totalAppointments;
    private long todaysAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
}