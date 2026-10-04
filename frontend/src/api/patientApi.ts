
import axiosClient from './axiosClient';

import type { ApiResponse } from '@/types';

export interface MedicalHistoryEntry {
  appointmentId: number;
  consultationId: number | null;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  specialization: string;
  hospitalName: string;
  appointmentStatus: string;
  diagnosisSummary: string | null;
  prescriptionSummary: string | null;
}

/**
 * Patient's own medical history
 */
export async function getMyMedicalHistory(): Promise<MedicalHistoryEntry[]> {
  const response = await axiosClient.get<
    ApiResponse<MedicalHistoryEntry[]>
  >('/patients/me/medical-history');

  return response.data.data;
}

/**
 * Doctor views a patient's medical history.
 *
 * Backend:
 * GET /api/doctors/patients/{patientProfileId}/history
 */
export async function getPatientHistoryForDoctor(
  patientProfileId: number
): Promise<MedicalHistoryEntry[]> {
  const response = await axiosClient.get<
    ApiResponse<MedicalHistoryEntry[]>
  >(`/doctors/patients/${patientProfileId}/history`);

  return response.data.data;
}

