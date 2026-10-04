package com.healthcareapp.prescription;

import com.healthcareapp.common.exceptions.LockedRecordException;
import com.healthcareapp.consultation.ConsultationStatus;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

public class PrescriptionLockListener {

    @PreUpdate
    public void onPreUpdate(Prescription prescription) {
        checkNotLocked(prescription);
    }

    @PreRemove
    public void onPreRemove(Prescription prescription) {
        checkNotLocked(prescription);
    }

    private void checkNotLocked(Prescription prescription) {
        if (prescription.getConsultation() != null
                && prescription.getConsultation().getStatus() == ConsultationStatus.LOCKED) {
            throw new LockedRecordException(
                    "This consultation is locked — prescription cannot be modified.");
        }
    }
}