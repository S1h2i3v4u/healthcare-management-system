import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '@/types';

// =========================================================
// ADMIN DASHBOARD
// =========================================================

export interface AdminDashboardData {
  totalPatients: number;
  totalDoctors: number;
  pendingDoctorVerifications: number;
  verifiedDoctors: number;
  totalHospitals: number;
  totalAppointments: number;
  todaysAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

// =========================================================
// ADMIN DOCTOR
// =========================================================

export interface AdminDoctorListItem {
  id: number;
  fullName: string;
  profilePhotoUrl?: string;
  medicalRegistrationNumber: string;
  specialization: string;
  verificationStatus: string;
  city: string;
}

// =========================================================
// ADMIN PATIENT
// =========================================================

export interface AdminPatientListItem {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  active: boolean;
  createdAt: string;
}

// =========================================================
// ADMIN APPOINTMENT
// =========================================================

export interface AdminAppointmentListItem {
  id: number;

  appointmentDate: string;
  appointmentTime: string;
  status: string;

  patientId?: number;
  patientName?: string;

  doctorProfileId?: number;
  doctorName?: string;

  hospitalId?: number;
  hospitalName?: string;
}

// =========================================================
// ADMIN APPOINTMENT SEARCH
// =========================================================

export interface AdminAppointmentSearchParams {
  doctorProfileId?: number;
  hospitalId?: number;
  status?: string;
  date?: string;
  page?: number;
  size?: number;
}

// =========================================================
// DASHBOARD
// =========================================================

export async function getDashboard(): Promise<AdminDashboardData> {
  const response = await axiosClient.get<
    ApiResponse<AdminDashboardData>
  >('/admin/dashboard');

  return response.data.data;
}

// =========================================================
// DOCTOR MANAGEMENT
// =========================================================

export async function getAdminDoctorList(
  status?: string
): Promise<PageResponse<AdminDoctorListItem>> {
  const response = await axiosClient.get<
    ApiResponse<PageResponse<AdminDoctorListItem>>
  >('/admin/doctors', {
    params: {
      status,
      size: 50,
    },
  });

  return response.data.data;
}

export async function verifyDoctor(
  doctorProfileId: number
): Promise<void> {
  await axiosClient.put(
    `/admin/doctors/${doctorProfileId}/verify`
  );
}

export async function rejectDoctor(
  doctorProfileId: number
): Promise<void> {
  await axiosClient.put(
    `/admin/doctors/${doctorProfileId}/reject`
  );
}

// =========================================================
// PATIENT MANAGEMENT
// =========================================================

export async function getAdminPatientList(
  search?: string
): Promise<PageResponse<AdminPatientListItem>> {
  const response = await axiosClient.get<
    ApiResponse<PageResponse<AdminPatientListItem>>
  >('/admin/patients', {
    params: {
      search,
      size: 50,
    },
  });

  return response.data.data;
}

export async function suspendPatient(
  patientUserId: number
): Promise<void> {
  await axiosClient.put(
    `/admin/patients/${patientUserId}/suspend`
  );
}

export async function activatePatient(
  patientUserId: number
): Promise<void> {
  await axiosClient.put(
    `/admin/patients/${patientUserId}/activate`
  );
}

// =========================================================
// APPOINTMENT MANAGEMENT
// =========================================================

export async function getAdminAppointments(
  params: AdminAppointmentSearchParams = {}
): Promise<PageResponse<AdminAppointmentListItem>> {
  const response = await axiosClient.get<
    ApiResponse<PageResponse<AdminAppointmentListItem>>
  >('/admin/appointments', {
    params: {
      ...params,
      size: params.size ?? 20,
    },
  });

  return response.data.data;
}