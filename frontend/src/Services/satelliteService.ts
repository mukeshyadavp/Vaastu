import { apiUrl, handleResponse } from "./apiClient";

/* ===============================
   Satellite AI Types
================================ */

export type SatelliteAlert = {
  id: string;
  lat: number;
  lng: number;
  detectedAreaSqM: number;
  confidence: number;
  changeType: string;
  permitFound: boolean;
  status: string;
  severity: string;
  action: string;
};

export type SatelliteScanResponse = {
  success: boolean;
  message: string;
  result: {
    engine: string;
    scanStatus: string;
    totalChangesDetected: number;
    unauthorizedAlerts: number;
    alerts: SatelliteAlert[];
  };
};

/* ===============================
   Satellite AI API
================================ */

export async function runSatelliteScan(): Promise<SatelliteScanResponse> {
  const response = await fetch(apiUrl("/api/ai/satellite-scan"), {
    method: "POST",
  });

  return handleResponse<SatelliteScanResponse>(
    response,
    "Satellite scan failed"
  );
}