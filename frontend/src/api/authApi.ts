import axiosClient from './axiosClient';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterDoctorRequest,
  RegisterPatientRequest,
} from '@/types';

// One function per backend endpoint, each returning the UNWRAPPED data —
// callers get an AuthResponse directly, not an ApiResponse<AuthResponse>.
// Unwrapping happens here, once, rather than every component that calls
// these functions needing to remember to reach into `.data` itself.

export async function registerPatient(payload: RegisterPatientRequest): Promise<AuthResponse> {
  const response = await axiosClient.post<ApiResponse<AuthResponse>>(
    '/auth/register/patient',
    payload,
  );
  return response.data.data;
}

export async function registerDoctor(payload: RegisterDoctorRequest): Promise<AuthResponse> {
  const response = await axiosClient.post<ApiResponse<AuthResponse>>(
    '/auth/register/doctor',
    payload,
  );
  return response.data.data;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  return response.data.data;
}

export async function getCurrentUser(): Promise<Record<string, unknown>> {
  const response = await axiosClient.get<ApiResponse<Record<string, unknown>>>('/auth/me');
  return response.data.data;
}