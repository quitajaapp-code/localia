/**
 * Utilitário tipado para chamadas à Google Places API (client-side).
 * Usa a chave pública VITE_GOOGLE_MAPS_API_KEY.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// ---------- Types ----------

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  geometry?: {
    location: { lat: number; lng: number };
  };
  types?: string[];
  photos?: Array<{ photo_reference: string; width: number; height: number }>;
}

export interface PlaceDetailsResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: PlaceReview[];
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{ photo_reference: string; width: number; height: number }>;
}

export interface PlaceReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  type?: string;
  keyword?: string;
}

// ---------- Helpers ----------

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      console.warn(`[places] retry ${i + 1}/${attempts}, status=${res.status}`);
    } catch (err) {
      console.warn(`[places] retry ${i + 1}/${attempts}:`, err);
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error(`Google Places request failed after ${attempts} attempts`);
}

function getApiKey(): string {
  if (!API_KEY) throw new Error("VITE_GOOGLE_MAPS_API_KEY not configured");
  return API_KEY;
}

// ---------- API methods ----------

export async function nearbySearch(params: NearbySearchParams): Promise<PlaceSearchResult[]> {
  const { lat, lng, radius = 5000, type = "establishment", keyword = "" } = params;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${encodeURIComponent(type)}&keyword=${encodeURIComponent(keyword)}&key=${getApiKey()}`;
  const res = await fetchWithRetry(url);
  const json = await res.json();
  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    throw new Error(`Places API: ${json.status} - ${json.error_message ?? "Unknown error"}`);
  }
  return (json.results ?? []) as PlaceSearchResult[];
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
  const fields = "place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,opening_hours,photos";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${getApiKey()}`;
  const res = await fetchWithRetry(url);
  const json = await res.json();
  if (json.status !== "OK") {
    throw new Error(`Place Details: ${json.status} - ${json.error_message ?? "Unknown error"}`);
  }
  return json.result as PlaceDetailsResult;
}

export function getPhotoUrl(photoReference: string, maxWidth = 400): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${getApiKey()}`;
}

export async function geocodeCity(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${city}, ${state}, Brazil`)}&key=${getApiKey()}`;
  const res = await fetchWithRetry(url);
  const json = await res.json();
  if (!json.results?.length) return null;
  return json.results[0].geometry.location as { lat: number; lng: number };
}
