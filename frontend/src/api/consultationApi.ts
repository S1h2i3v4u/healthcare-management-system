import axiosClient from './axiosClient';

import type {
  ApiResponse,
  Consultation,
  MedicalDocument,
  ConsultationDraftRequest,
  CompleteConsultationRequest,
} from '@/types';

export async function getConsultationByAppointmentId(
  appointmentId: number
): Promise<Consultation> {
  const response = await axiosClient.get<ApiResponse<Consultation>>(
    `/appointments/${appointmentId}/consultation`
  );

  return response.data.data;
}

export async function getDocumentsForAppointment(
  appointmentId: number
): Promise<MedicalDocument[]> {
  const response = await axiosClient.get<ApiResponse<MedicalDocument[]>>(
    `/appointments/${appointmentId}/documents`
  );

  return response.data.data;
}

// ============================================================
// UPLOAD DOCUMENT
// ============================================================

export async function uploadDocument(
  appointmentId: number,
  file: File,
  documentType: string
): Promise<MedicalDocument> {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('documentType', documentType);

  const response = await axiosClient.post<ApiResponse<MedicalDocument>>(
    `/appointments/${appointmentId}/documents`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
}

// Downloads via axiosClient so the JWT interceptor attaches correctly.
export async function downloadDocument(
  documentId: number,
  filename: string
): Promise<void> {
  const response = await axiosClient.get(
    `/documents/${documentId}/download`,
    {
      responseType: 'blob',
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

/**
 * Save an active consultation as a draft.
 *
 * Backend:
 * PUT /api/appointments/{appointmentId}/consultation/draft
 */
export async function saveDraft(
  appointmentId: number,
  payload: ConsultationDraftRequest
): Promise<Consultation> {
  const response = await axiosClient.put<ApiResponse<Consultation>>(
    `/appointments/${appointmentId}/consultation/draft`,
    payload
  );

  return response.data.data;
}

/**
 * Complete the consultation.
 *
 * Backend:
 * POST /api/appointments/{appointmentId}/complete
 */
export async function completeConsultation(
  appointmentId: number,
  payload: CompleteConsultationRequest
): Promise<Consultation> {
  const response = await axiosClient.post<ApiResponse<Consultation>>(
    `/appointments/${appointmentId}/complete`,
    payload
  );

  return response.data.data;
}

