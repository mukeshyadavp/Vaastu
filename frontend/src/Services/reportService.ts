import { apiUrl } from "./apiClient";

/* ===============================
   Report Helpers
================================ */

export function getReportDownloadUrl(downloadUrl: string) {
  if (!downloadUrl) return "";

  if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
    return downloadUrl;
  }

  return apiUrl(downloadUrl);
}