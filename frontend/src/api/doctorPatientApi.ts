import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types';

export interface PatientListItem {
  patientProfileId: number;
  fullName: string;
  age: number | null;
  gender: string | null;
  lastAppointmentDate: string | null;
  nextAppointmentDate: string | null;
}

export async function getMyPatients(): Promise<PatientListItem[]> {
  const response = await axiosClient.get<ApiResponse<PatientListItem[]>>('/doctors/me/patients');
  return response.data.data;
}