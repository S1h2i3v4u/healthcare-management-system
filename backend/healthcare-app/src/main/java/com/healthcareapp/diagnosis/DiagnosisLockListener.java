package com.healthcareapp.diagnosis;

import com.healthcareapp.common.exceptions.LockedRecordException;
import com.healthcareapp.consultation.ConsultationStatus;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

public class DiagnosisLockListener {

    @PreUpdate
    public void onPreUpdate(Diagnosis diagnosis) {
        checkNotLocked(diagnosis);
    }

    @PreRemove
    public void onPreRemove(Diagnosis diagnosis) {
        checkNotLocked(diagnosis);
    }

    private void checkNotLocked(Diagnosis diagnosis) {
        if (diagnosis.getConsultation() != null
                && diagnosis.getConsultation().getStatus() == ConsultationStatus.LOCKED) {
            throw new LockedRecordException(
                    "This consultation is locked — diagnosis cannot be modified.");
        }
    }
}