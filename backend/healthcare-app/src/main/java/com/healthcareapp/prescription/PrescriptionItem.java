package com.healthcareapp.prescription;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// One medicine line within a Prescription (§16.F) — a Prescription has many
// of these, e.g. "Paracetamol 500mg twice daily" as one row, "Amoxicillin
// 250mg three times daily" as another.
@Entity
@Table(name = "prescription_items")
@EntityListeners(PrescriptionItemLockListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String dosage; // e.g. "500 mg"

    @Column(nullable = false)
    private String frequency; // e.g. "Twice daily"

    private String route; // e.g. "Oral" — optional per §16.F's field list

    @Column(nullable = false)
    private String duration; // e.g. "5 days"

    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String instructions; // e.g. "After food"
}