import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

export type ApplicationItem = {
  id: number;
  applicantName: string;
  status: string;
  location: string;
  plotSize: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type ApplicationPayload = {
  applicantName: string;
  location: string;
  plotSize: string;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type ApplicationResponse = {
  success: boolean;
  message?: string;
  data: ApplicationItem;
};

export type ApplicationsListResponse = {
  success: boolean;
  data: ApplicationItem[];
};

export async function getApplications(): Promise<ApplicationsListResponse> {
  return apiGet<ApplicationsListResponse>("/api/applications");
}

export async function createApplication(
  payload: ApplicationPayload
): Promise<ApplicationResponse> {
  return apiPost<ApplicationResponse>("/api/applications", payload);
}

export async function updateApplication(
  id: number,
  payload: ApplicationPayload
): Promise<ApplicationResponse> {
  return apiPut<ApplicationResponse>(`/api/applications/${id}`, payload);
}

export async function deleteApplication(
  id: number
): Promise<{ success: boolean; message?: string }> {
  return apiDelete<{ success: boolean; message?: string }>(
    `/api/applications/${id}`
  );
}

export async function approveApplication(
  id: number
): Promise<ApplicationResponse> {
  return apiPut<ApplicationResponse>(`/api/applications/${id}/approve`);
}

export async function rejectApplication(
  id: number
): Promise<ApplicationResponse> {
  return apiPut<ApplicationResponse>(`/api/applications/${id}/reject`);
}