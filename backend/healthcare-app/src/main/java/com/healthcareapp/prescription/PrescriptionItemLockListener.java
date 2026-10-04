package com.healthcareapp.prescription;

import com.healthcareapp.common.exceptions.LockedRecordException;
import com.healthcareapp.consultation.ConsultationStatus;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

// PrescriptionItem is one level further removed from Consultation than
// Prescription itself (Item -> Prescription -> Consultation), so this
// listener reaches through that extra hop to find the real lock state.
public class PrescriptionItemLockListener {

    @PreUpdate
    public void onPreUpdate(PrescriptionItem item) {
        checkNotLocked(item);
    }

    @PreRemove
    public void onPreRemove(PrescriptionItem item) {
        checkNotLocked(item);
    }

    private void checkNotLocked(PrescriptionItem item) {
        if (item.getPrescription() != null
                && item.getPrescription().getConsultation() != null
                && item.getPrescription().getConsultation().getStatus() == ConsultationStatus.LOCKED) {
            throw new LockedRecordException(
                    "This consultation is locked — prescription items cannot be modified.");
        }
    }
}