import { apiUrl, handleResponse } from "./apiClient";

/* ===============================
   CAD Preview Types
================================ */

export type CadPreviewResponse = {
  success: boolean;
  previewUrl: string;
  message?: string;
};

/* ===============================
   CAD Preview API
================================ */

export async function generateCadPreview(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(apiUrl("/api/cad/preview"), {
    method: "POST",
    body: formData,
  });

  const data = await handleResponse<CadPreviewResponse>(
    response,
    "CAD preview failed"
  );

  return data.previewUrl;
}