import { apiUrl, handleResponse } from "./apiClient";

/* ===============================
   Location Search Types
================================ */

export type LocationSuggestion = {
  place_id?: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  importance?: number;
};

export type LocationSearchResponse = {
  success: boolean;
  data: LocationSuggestion[];
  message?: string;
};

/* ===============================
   Location Search API
================================ */

export async function searchLocationSuggestions(
  query: string
): Promise<LocationSuggestion[]> {
  const response = await fetch(
    apiUrl(`/api/location/search?q=${encodeURIComponent(query)}`)
  );

  const data = await handleResponse<LocationSearchResponse>(
    response,
    "Location search failed"
  );

  return data.data || [];
}