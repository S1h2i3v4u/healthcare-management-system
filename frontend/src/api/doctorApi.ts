import axiosClient from './axiosClient';
import type { ApiResponse, AvailabilitySlot, Doctor, PageResponse } from '@/types';

export interface DoctorSearchParams {
  name?: string;
  specialization?: string;
  hospital?: string;
  city?: string;
  minExperience?: number;
  maxFee?: number;
  page?: number;
  size?: number;
}

export async function searchDoctors(
  params: DoctorSearchParams
): Promise<PageResponse<Doctor>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<Doctor>>>(
    '/doctors',
    { params }
  );

  return response.data.data;
}

export async function getDoctorById(id: number): Promise<Doctor> {
  const response = await axiosClient.get<ApiResponse<Doctor>>(
    `/doctors/${id}`
  );

  return response.data.data;
}

export async function getDoctorAvailability(
  id: number,
  date: string
): Promise<AvailabilitySlot[]> {
  const response = await axiosClient.get<ApiResponse<AvailabilitySlot[]>>(
    `/doctors/${id}/availability`,
    {
      params: { date },
    }
  );

  return response.data.data;
}

/* =========================
   CITY & SPECIALIZATION
   ========================= */

export interface SpecializationCount {
  specialization: string;
  doctorCount: number;
}

export async function getAvailableCities(): Promise<string[]> {
  const response = await axiosClient.get<ApiResponse<string[]>>(
    '/doctors/cities'
  );

  return response.data.data;
}

export async function getSpecializationsForCity(
  city: string
): Promise<SpecializationCount[]> {
  const response = await axiosClient.get<ApiResponse<SpecializationCount[]>>(
    '/doctors/specializations',
    {
      params: { city },
    }
  );

  return response.data.data;
}

/* =========================
   SAVED DOCTORS
   ========================= */

export async function saveDoctor(doctorId: number): Promise<void> {
  await axiosClient.post(`/doctors/${doctorId}/save`);
}

export async function unsaveDoctor(doctorId: number): Promise<void> {
  await axiosClient.delete(`/doctors/${doctorId}/save`);
}

export async function getSavedDoctors(): Promise<Doctor[]> {
  const response = await axiosClient.get<ApiResponse<Doctor[]>>(
    '/doctors/saved'
  );

  return response.data.data;
}