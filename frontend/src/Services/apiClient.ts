const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function apiUrl(endpoint: string) {
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${cleanBase}${cleanEndpoint}`;
}

export async function handleResponse<T>(
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