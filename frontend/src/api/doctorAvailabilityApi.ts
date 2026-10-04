import axiosClient from './axiosClient';
import type { ApiResponse, DoctorAvailabilityRule, CreateAvailabilityRequest } from '@/types';

export async function getMyAvailability(): Promise<DoctorAvailabilityRule[]> {
  const response = await axiosClient.get<ApiResponse<DoctorAvailabilityRule[]>>('/doctors/me/availability');
  return response.data.data;
}

export async function addAvailability(payload: CreateAvailabilityRequest): Promise<DoctorAvailabilityRule> {
  const response = await axiosClient.post<ApiResponse<DoctorAvailabilityRule>>('/doctors/me/availability', payload);
  return response.data.data;
}

export async function deleteAvailability(id: number): Promise<void> {
  await axiosClient.delete(`/doctors/me/availability/${id}`);
}