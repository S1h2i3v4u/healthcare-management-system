package com.healthcareapp.common.exceptions;

public class LockedRecordException extends RuntimeException {
    public LockedRecordException(String message) {
        super(message);
    }
}