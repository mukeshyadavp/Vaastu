const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function apiUrl(endpoint: string) {
  return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  if (!response.ok) {
    let errorMessage = fallbackMessage;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || fallbackMessage;
    } catch {
      errorMessage = fallbackMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/* ===============================
   Basic API Helpers
================================ */

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(apiUrl(endpoint));
  return handleResponse<T>(response, "API GET request failed");
}

export async function apiPost<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await fetch(apiUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response, "API POST request failed");
}

export async function apiPut<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  const response = await fetch(apiUrl(endpoint), {
    method: "PUT",
    headers: data
      ? {
          "Content-Type": "application/json",
        }
      : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response, "API PUT request failed");
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetch(apiUrl(endpoint), {
    method: "DELETE",
  });

  return handleResponse<T>(response, "API DELETE request failed");
}

export async function uploadFile<T>(file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(apiUrl("/api/upload"), {
    method: "POST",
    body: formData,
  });

  return handleResponse<T>(response, "File upload failed");
}

/* ===============================
   Applications Types
================================ */

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

/* ===============================
   AI Auto-DCR Types
================================ */

export type AutoDcrViolation = {
  rule: string;
  required: string | number;
  found: string | number;
  message: string;
  suggestion?: string;
  reference?: string;
};

export type AutoDcrCheck = {
  rule: string;
  status: "PASSED" | "FAILED";
  submitted: number;
  required: number;
  unit: string;
  reference: string;
  message: string;
  suggestion: string;
};

export type AutoDcrResult = {
  engine: string;
  status: "PASSED" | "FAILED";
  isCompliant: boolean;
  checks?: AutoDcrCheck[];
  summary?: {
    passed: number;
    warnings: number;
    violations: number;
    totalChecks: number;
  };
  measurements: Record<string, number>;
  rules: Record<string, number>;
  violations: AutoDcrViolation[];
  recommendation: string;
  applicationDetails?: {
    buildingType: string;
    classification: string;
  };
  aiAnalysis?: {
    enabled: boolean;
    provider?: string;
    model?: string;
    summary: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
    citizenMessage: string;
    officerNotes: string[];
    correctionSteps: string[];
    missingInputs: string[];
  };
};

export type AutoDcrResponse = {
  success: boolean;
  message: string;
  filename: string;
  result: AutoDcrResult;
  pdf: {
    applicationNo: string;
    status: string;
    downloadUrl: string;
  };
};

export type AutoDcrMeta = {
  buildingType?: string;
  floors?: number;
  height?: number;
  classification?: string;

  plotArea?: number;
  builtupArea?: number;
  frontSetback?: number;
  rearSetback?: number;
  side1Setback?: number;
  side2Setback?: number;
  roadWidth?: number;
  parkingPercent?: number;
  roomArea?: number;
  roomWidth?: number;
  kitchenArea?: number;
  rainWaterHarvesting?: boolean;
  fireNoc?: boolean;
};

export function runAutoDcr(
  file: File,
  meta: AutoDcrMeta = {},
  onProgress?: (progress: number) => void
): Promise<AutoDcrResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    formData.append("file", file);

    formData.append("buildingType", meta.buildingType || "Residential");
    formData.append("floors", String(meta.floors ?? 2));
    formData.append("height", String(meta.height ?? 7.0));
    formData.append("classification", meta.classification || "Non-High-Rise");

    formData.append("plotArea", String(meta.plotArea ?? 300));
    formData.append("builtupArea", String(meta.builtupArea ?? 300));
    formData.append("frontSetback", String(meta.frontSetback ?? 3.5));
    formData.append("rearSetback", String(meta.rearSetback ?? 2.5));
    formData.append("side1Setback", String(meta.side1Setback ?? 2.0));
    formData.append("side2Setback", String(meta.side2Setback ?? 2.0));
    formData.append("roadWidth", String(meta.roadWidth ?? 9));
    formData.append("parkingPercent", String(meta.parkingPercent ?? 40));
    formData.append("roomArea", String(meta.roomArea ?? 12));
    formData.append("roomWidth", String(meta.roomWidth ?? 3));
    formData.append("kitchenArea", String(meta.kitchenArea ?? 6));
    formData.append(
      "rainWaterHarvesting",
      String(meta.rainWaterHarvesting ?? true)
    );
    formData.append("fireNoc", String(meta.fireNoc ?? false));

    console.log("Running Auto-DCR:", {
      file: file.name,
      meta,
      url: apiUrl("/api/ai/auto-dcr"),
    });

    const xhr = new XMLHttpRequest();

    xhr.open("POST", apiUrl("/api/ai/auto-dcr"), true);
    xhr.timeout = 120000;

    xhr.onloadstart = () => {
      onProgress?.(1);
    };

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const uploadPercent = Math.round((event.loaded / event.total) * 75);
        onProgress?.(uploadPercent);
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        onProgress?.(85);
      }

      if (xhr.readyState === XMLHttpRequest.LOADING) {
        onProgress?.(90);
      }
    };

    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          resolve(JSON.parse(xhr.responseText) as AutoDcrResponse);
          return;
        }

        let errorMessage = "AI Auto-DCR failed";

        try {
          const errorData = JSON.parse(xhr.responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = xhr.responseText || errorMessage;
        }

        reject(new Error(errorMessage));
      } catch {
        reject(new Error("Invalid server response from Auto-DCR API"));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error. Flask server is not reachable."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Auto-DCR request timed out."));
    };

    xhr.send(formData);
  });
}

/* ===============================
   CAD Preview
================================ */

export type CadPreviewResponse = {
  success: boolean;
  previewUrl: string;
  message?: string;
};

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

/* ===============================
   Satellite AI
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

export async function runSatelliteScan(): Promise<SatelliteScanResponse> {
  const response = await fetch(apiUrl("/api/ai/satellite-scan"), {
    method: "POST",
  });

  return handleResponse<SatelliteScanResponse>(
    response,
    "Satellite scan failed"
  );
}

/* ===============================
   GPS Validation
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