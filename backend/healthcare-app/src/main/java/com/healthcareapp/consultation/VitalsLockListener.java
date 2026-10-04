package com.healthcareapp.consultation;

import com.healthcareapp.common.exceptions.LockedRecordException;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

// Unlike ConsultationLockListener, this doesn't need a @PostLoad snapshot —
// Vitals has no "legitimate transition into locked" of its own; it's simply
// never allowed to change once its PARENT Consultation is locked. So we can
// check the parent's current status directly at update/remove time.
public class VitalsLockListener {

    @PreUpdate
    public void onPreUpdate(Vitals vitals) {
        checkNotLocked(vitals);
    }

    @PreRemove
    public void onPreRemove(Vitals vitals) {
        checkNotLocked(vitals);
    }

    private void checkNotLocked(Vitals vitals) {
        if (vitals.getConsultation() != null
                && vitals.getConsultation().getStatus() == ConsultationStatus.LOCKED) {
            throw new LockedRecordException(
                    "This consultation is locked — vitals cannot be modified.");
        }
    }
}