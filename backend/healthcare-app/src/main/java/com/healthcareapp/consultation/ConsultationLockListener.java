package com.healthcareapp.consultation;

import com.healthcareapp.common.exceptions.LockedRecordException;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

// This is the backend-level enforcement of §19's core rule: once a
// Consultation's status is LOCKED, no UPDATE or DELETE may ever succeed
// against it, regardless of what the application/service layer tries to do.
//
// This listener is registered on Consultation via @EntityListeners, so
// Hibernate invokes these callback methods automatically at the right point
// in every entity's lifecycle — no service method needs to remember to call
// this manually, which is exactly the point: it can't be forgotten or
// bypassed by a future developer (or future you) adding a new update path
// later.
public class ConsultationLockListener {

    // Fires immediately after Hibernate loads a Consultation row from the
    // database (on every SELECT that returns one). We snapshot the status
    // it was loaded WITH into the transient field, so @PreUpdate below has
    // something to compare against later in the same persistence context.
    @PostLoad
    public void onLoad(Consultation consultation) {
        consultation.setOriginalStatusAtLoad(consultation.getStatus());
    }

    // Fires immediately before Hibernate issues an UPDATE statement for this
    // entity — but AFTER any setters have already been called on it in your
    // service code. This is the actual enforcement point.
    @PreUpdate
    public void onPreUpdate(Consultation consultation) {
        if (consultation.getOriginalStatusAtLoad() == ConsultationStatus.LOCKED) {
            throw new LockedRecordException(
                    "This consultation record is locked and cannot be modified. " +
                    "If a correction is needed, submit a MedicalRecordAmendment instead."
            );
        }
    }

    // Fires immediately before Hibernate issues a DELETE statement. No
    // service method in this codebase currently deletes a Consultation at
    // all — but this exists as a second line of defense per §19's spirit:
    // immutability shouldn't depend on "nobody ever adds a delete feature
    // later without re-reading this comment." Locked or not, deletion is
    // blocked outright.
    @PreRemove
    public void onPreRemove(Consultation consultation) {
        if (consultation.getStatus() == ConsultationStatus.LOCKED) {
            throw new LockedRecordException(
                    "This consultation record is locked and cannot be deleted."
            );
        }
    }
}