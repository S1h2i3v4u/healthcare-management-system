import axiosClient from './axiosClient';
import type { ApiResponse, Doctor } from '@/types';

export interface UpdateDoctorProfileRequest {
  medicalQualification?: string;
  specialization?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  city?: string;
  address?: string;
  profilePhotoUrl?: string;
  professionalBio?: string;
}

export async function getMyDoctorProfile(): Promise<Doctor> {
  const response = await axiosClient.get<ApiResponse<Doctor>>('/doctors/me');
  return response.data.data;
}

export async function updateMyDoctorProfile(
  payload: UpdateDoctorProfileRequest
): Promise<Doctor> {
  const response = await axiosClient.put<ApiResponse<Doctor>>(
    '/doctors/me',
    payload
  );
  return response.data.data;
}