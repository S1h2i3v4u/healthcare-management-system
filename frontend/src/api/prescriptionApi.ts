import axiosClient from './axiosClient';
import type { ApiResponse, Prescription } from '@/types';

export async function getMyPrescriptions(): Promise<Prescription[]> {
  const response = await axiosClient.get<ApiResponse<Prescription[]>>('/prescriptions/my');
  return response.data.data;
}

export async function getPrescriptionById(id: number): Promise<Prescription> {
  const response = await axiosClient.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);
  return response.data.data;
}

// Same authenticated-blob-download pattern used for medical documents —
// a plain <a href> can't carry the JWT this endpoint requires.
export async function downloadPrescriptionPdf(id: number): Promise<void> {
  const response = await axiosClient.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `prescription-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}