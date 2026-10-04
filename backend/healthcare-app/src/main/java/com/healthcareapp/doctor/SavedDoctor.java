package com.healthcareapp.doctor;

import com.healthcareapp.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// A patient bookmarking a doctor — the "like/save" feature. One row per
// (patient, doctor) pair. Deliberately its own simple join entity rather
// than a field on User or DoctorProfile, since a patient can save many
// doctors and this relationship has its own lifecycle (created when
// saved, deleted when un-saved) independent of either side's own record.
@Entity
@Table(name = "saved_doctors", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"patient_user_id", "doctor_profile_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedDoctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_profile_id", nullable = false)
    private DoctorProfile doctorProfile;

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}