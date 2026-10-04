import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '@/types';

export interface AuditLogEntry {
  id: number;
  userId: number | null;
  role: string | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  createdAt: string;
}

export interface AuditLogSearchParams {
  userId?: number;
  action?: string;
  entityType?: string;
  page?: number;
  size?: number;
}

export async function searchAuditLogs(params: AuditLogSearchParams): Promise<PageResponse<AuditLogEntry>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<AuditLogEntry>>>('/admin/audit-logs', { params });
  return response.data.data;
}