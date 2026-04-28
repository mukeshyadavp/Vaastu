import { apiUrl, handleResponse } from "./apiClient";

export async function uploadFile<T>(file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(apiUrl("/api/upload"), {
    method: "POST",
    body: formData,
  });

  return handleResponse<T>(response, "File upload failed");
}