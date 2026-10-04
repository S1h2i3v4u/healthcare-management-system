import axiosClient from './axiosClient';
import type {
  ApiResponse,
  Appointment,
  BookAppointmentRequest,
} from '@/types';

export async function bookAppointment(
  payload: BookAppointmentRequest
): Promise<Appointment> {
  const response = await axiosClient.post<ApiResponse<Appointment>>(
    '/appointments',
    payload
  );

  return response.data.data;
}

// ==================== PATIENT APPOINTMENTS ====================

export async function getMyAppointments(): Promise<Appointment[]> {
  const response = await axiosClient.get<ApiResponse<Appointment[]>>(
    '/appointments/my'
  );

  return response.data.data;
}

// ==================== DOCTOR APPOINTMENTS ====================

export async function getMyAppointmentsAsDoctor(): Promise<Appointment[]> {
  const response = await axiosClient.get<ApiResponse<Appointment[]>>(
    '/appointments/my/doctor'
  );

  return response.data.data;
}

// ==================== APPOINTMENT DETAILS ====================

export async function getAppointmentById(
  id: number
): Promise<Appointment> {
  const response = await axiosClient.get<ApiResponse<Appointment>>(
    `/appointments/${id}`
  );

  return response.data.data;
}

// ==================== CANCEL ====================

export async function cancelAppointment(
  id: number,
  reason: string
): Promise<Appointment> {
  const response = await axiosClient.post<ApiResponse<Appointment>>(
    `/appointments/${id}/cancel`,
    { reason }
  );

  return response.data.data;
}

// ==================== RESCHEDULE ====================

export async function rescheduleAppointment(
  id: number,
  payload: {
    newDate: string;
    newTime: string;
    reason: string;
  }
): Promise<Appointment> {
  const response = await axiosClient.put<ApiResponse<Appointment>>(
    `/appointments/${id}/reschedule`,
    payload
  );

  return response.data.data;
}

