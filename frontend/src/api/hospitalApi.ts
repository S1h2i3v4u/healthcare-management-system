import axiosClient from './axiosClient';
import type { ApiResponse, Hospital, PageResponse } from '@/types';

export interface HospitalSearchParams {
  name?: string;
  city?: string;
  specialty?: string;
  page?: number;
  size?: number;
}

export interface HospitalFormData {
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
}

export async function searchHospitals(
  params: HospitalSearchParams
): Promise<PageResponse<Hospital>> {
  const response = await axiosClient.get<
    ApiResponse<PageResponse<Hospital>>
  >('/hospitals', { params });

  return response.data.data;
}

export async function createHospital(
  payload: HospitalFormData
): Promise<Hospital> {
  const response = await axiosClient.post<
    ApiResponse<Hospital>
  >('/hospitals', payload);

  return response.data.data;
}

export async function updateHospital(
  id: number,
  payload: HospitalFormData
): Promise<Hospital> {
  const response = await axiosClient.put<
    ApiResponse<Hospital>
  >(`/hospitals/${id}`, payload);

  return response.data.data;
}

export async function deactivateHospital(
  id: number
): Promise<void> {
  await axiosClient.delete(`/hospitals/${id}`);
}

// ============================================================
// ADMIN HOSPITAL MANAGEMENT
// ============================================================

export async function getAllHospitalsForAdmin(): Promise<
  PageResponse<Hospital>
> {
  const response = await axiosClient.get<
    ApiResponse<PageResponse<Hospital>>
  >('/hospitals/admin/all', {
    params: { size: 50 },
  });

  return response.data.data;
}

export async function reactivateHospital(
  id: number
): Promise<void> {
  await axiosClient.put(`/hospitals/${id}/reactivate`);
}

