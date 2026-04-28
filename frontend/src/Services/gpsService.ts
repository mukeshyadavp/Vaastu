import { apiUrl, handleResponse } from "./apiClient";

/* ===============================
   GPS Validation Types
================================ */

export type GpsValidationPayload = {
  userLat: number;
  userLng: number;
  alertLat: number;
  alertLng: number;
};

export type GpsValidationResponse = {
  success: boolean;
  result: {
    allowed: boolean;
    distanceMeters: number;
    allowedRadiusMeters: number;
    message: string;
  };
};

/* ===============================
   GPS Validation API
================================ */

export async function validateGpsLocation(
  payload: GpsValidationPayload
): Promise<GpsValidationResponse> {
  const response = await fetch(apiUrl("/api/field/validate-gps"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<GpsValidationResponse>(
    response,
    "GPS validation failed"
  );
}