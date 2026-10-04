package com.healthcareapp.hospital;

import com.healthcareapp.doctor.DoctorProfile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// Join entity linking a Doctor to a Hospital — modeled as its own entity
// (rather than a plain @ManyToMany) so a doctor can eventually have
// hospital-specific details (e.g. different consultation hours per hospital)
// without needing to restructure this relationship later.
@Entity
@Table(name = "hospital_doctors", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"hospital_id", "doctor_profile_id"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalDoctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne
    @JoinColumn(name = "doctor_profile_id", nullable = false)
    private DoctorProfile doctorProfile;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}