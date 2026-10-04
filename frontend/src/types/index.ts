// Mirrors the backend's DTOs closely enough for the frontend to be
// type-safe, without being a mechanical 1:1 copy of every Java field —
// some backend-only concerns (e.g. internal audit fields) are deliberately
// left out here since the frontend never needs them.

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type VerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export type AppointmentStatus =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type ConsultationStatus =
  | 'DRAFT'
  | 'LOCKED';

export type Gender =
  | 'MALE'
  | 'FEMALE'
  | 'OTHER';

export type DocumentType =
  | 'BLOOD_TEST'
  | 'URINE_TEST'
  | 'X_RAY'
  | 'MRI'
  | 'CT_SCAN'
  | 'PRESCRIPTION'
  | 'OTHER';


// ============================================================
// Auth
// ============================================================

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface RegisterPatientRequest {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: Gender;
  password: string;
  confirmPassword: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactMobile?: string;
  address?: string;
}

export interface RegisterDoctorRequest {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  medicalRegistrationNumber: string;
  medicalQualification: string;
  specialization: string;
  yearsOfExperience: number;
  hospitalName?: string;
  consultationFee: number;
  city: string;
  address: string;
  profilePhotoUrl?: string;
  professionalBio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}


// ============================================================
// Hospital
// ============================================================

export interface Hospital {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  phone: string;
  email?: string;
  website?: string;
  specialties?: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}


// ============================================================
// Doctor
// ============================================================

export interface Doctor {
  id: number;

  fullName: string;

  profilePhotoUrl?: string;

  verificationStatus: VerificationStatus;

  medicalQualification: string;

  specialization: string;

  yearsOfExperience: number;

  consultationFee: number;

  city: string;

  address: string;

  professionalBio?: string;

  /*
   * Hospital names are used for displaying the doctor's
   * practice locations.
   */
  hospitalNames: string[];

  /*
   * Hospital IDs are required when creating an appointment.
   *
   * Backend DoctorResponse provides these IDs so the patient
   * booking screen can send the required hospitalId.
   */
  hospitalIds: number[];

  isSaved?: boolean;
}


// ============================================================
// Admin Doctor
// ============================================================

/*
 * Lightweight doctor representation returned by the
 * admin doctor-management API.
 *
 * This intentionally contains only the fields used by
 * DoctorVerificationPage and other admin screens.
 */
export interface AdminDoctor {
  id: number;
  fullName: string;
  profilePhotoUrl?: string;
  medicalRegistrationNumber: string;
  specialization: string;
  verificationStatus: VerificationStatus;
  city: string;
}


export interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
}


// ============================================================
// Appointment
// ============================================================

export interface Appointment {
  id: number;

  // Patient details
  patientProfileId: number;
  patientName: string;

  // Doctor and hospital details
  doctorProfileId: number;
  doctorName: string;

  /*
   * Doctor profile photo.
   *
   * Returned by AppointmentResponse from the backend.
   * Used by patient appointment cards and appointment details.
   */
  profilePhotoUrl?: string;

  hospitalName: string;

  // Appointment details
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit?: string;
  status: AppointmentStatus;

  // Cancellation details
  cancelledBy?: string;
  cancellationReason?: string;
  cancelledAt?: string;

  // Rescheduling details
  originalDate?: string;
  originalTime?: string;
  rescheduledBy?: string;
  rescheduleReason?: string;

  createdAt: string;
}


export interface BookAppointmentRequest {
  doctorProfileId: number;
  hospitalId: number;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit?: string;
}


// ============================================================
// Consultation
// ============================================================

export interface VitalsDto {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  heightCm?: number;
  weightKg?: number;
}

export interface DiagnosisDto {
  diagnosisName: string;
  diagnosisDescription?: string;
  icdCode?: string;
}

export interface PrescriptionItemDto {
  medicineName: string;
  dosage: string;
  frequency: string;
  route?: string;
  duration: string;
  quantity?: number;
  instructions?: string;
}

export interface Consultation {
  id: number;
  appointmentId: number;
  status: ConsultationStatus;

  chiefComplaint?: string;
  symptoms?: string;
  examinationNotes?: string;
  medicalAdvice?: string;

  followUpRequired?: boolean;
  followUpDate?: string;
  followUpInstructions?: string;

  vitals?: VitalsDto;
  diagnosis?: DiagnosisDto;

  prescriptionItems: PrescriptionItemDto[];

  completedAt?: string;
  createdAt: string;
}


// ============================================================
// Prescription
// ============================================================

export interface Prescription {
  prescriptionId: number;
  consultationId: number;
  appointmentId: number;

  prescriptionDate: string;

  doctorName: string;
  medicalRegistrationNumber: string;
  hospitalName: string;

  diagnosisName?: string;

  medicines: PrescriptionItemDto[];

  followUpInstructions?: string;
}


// ============================================================
// Medical Document
// ============================================================

export interface MedicalDocument {
  id: number;
  appointmentId: number;

  documentName: string;
  documentType: DocumentType;

  uploadedByName: string;

  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;

  uploadedAt: string;
}


// ============================================================
// Notification
// ============================================================

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}


// ============================================================
// Generic API envelope
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}


export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}


// ============================================================
// Consultation Inputs
// ============================================================

export interface VitalsInput {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  heightCm?: number;
  weightKg?: number;
}


export interface DiagnosisInput {
  diagnosisName: string;
  diagnosisDescription?: string;
  icdCode?: string;
}


export interface PrescriptionItemInput {
  medicineName: string;
  dosage: string;
  frequency: string;
  route?: string;
  duration: string;
  quantity?: number;
  instructions?: string;
}


export interface ConsultationDraftRequest {
  chiefComplaint?: string;
  symptoms?: string;
  examinationNotes?: string;
  medicalAdvice?: string;

  followUpRequired?: boolean;
  followUpDate?: string;
  followUpInstructions?: string;

  vitals?: VitalsInput;

  diagnosis?: DiagnosisInput;

  prescriptionItems?: PrescriptionItemInput[];
}


export interface CompleteConsultationRequest
  extends ConsultationDraftRequest {
  chiefComplaint: string;
  examinationNotes: string;
  followUpRequired: boolean;
  vitals: VitalsInput;
  diagnosis: DiagnosisInput;
  prescriptionItems: PrescriptionItemInput[];
}


// ============================================================
// Doctor Availability
// ============================================================

export interface DoctorAvailabilityRule {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  breakStartTime?: string;
  breakEndTime?: string;
  active: boolean;
}


export interface CreateAvailabilityRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  breakStartTime?: string;
  breakEndTime?: string;
  active?: boolean;
}