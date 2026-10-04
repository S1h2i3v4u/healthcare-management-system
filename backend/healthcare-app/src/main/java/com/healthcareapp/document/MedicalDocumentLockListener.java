package com.healthcareapp.document;

import com.healthcareapp.common.exceptions.LockedRecordException;
import com.healthcareapp.consultation.Consultation;
import com.healthcareapp.consultation.ConsultationStatus;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

// Same delegated-lock pattern as Vitals/Diagnosis/Prescription — a document
// has no lock state of its own; it defers entirely to whether the
// consultation tied to its appointment is LOCKED. Note the extra hop here
// compared to those siblings: MedicalDocument links to Appointment
// directly (not Consultation directly), so this listener has to look up
// the Consultation via the appointment relationship rather than a direct
// field — flagged since it's structurally a little different from its
// siblings, even though the enforcement logic is identical in spirit.
public class MedicalDocumentLockListener {

    @PreUpdate
    public void onPreUpdate(MedicalDocument document) {
        checkNotLocked(document);
    }

    @PreRemove
    public void onPreRemove(MedicalDocument document) {
        checkNotLocked(document);
    }

    private void checkNotLocked(MedicalDocument document) {
        if (document.getAppointment() == null) {
            return; // shouldn't happen (appointment is @JoinColumn nullable=false), but fail safe
        }

        // NOTE: this reads document.getAppointment().getConsultation() —
        // but Appointment doesn't currently expose a direct getConsultation()
        // accessor; it's the INVERSE side of Consultation's @OneToOne to
        // Appointment. This requires a small addition to fetch it, since
        // Consultation owns that relationship (has the @JoinColumn), not
        // Appointment. Flagging this as a real gap to resolve, not glossing
        // over it — see the note below the code.
        Consultation consultation = document.getAppointment().getConsultation();

        if (consultation != null && consultation.getStatus() == ConsultationStatus.LOCKED) {
            throw new LockedRecordException(
                    "This consultation is locked — documents cannot be modified or removed.");
        }
    }
}