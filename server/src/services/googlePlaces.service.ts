/**
 * Google Places API service
 * Docs: https://developers.google.com/maps/documentation/places/web-service/details
 *
 * Required env:
 *   GOOGLE_PLACES_API_KEY
 *   GOOGLE_PLACE_ID
 */

interface GoogleRatingResult {
  score: number;
  totalReviews: number;
}

export async function fetchGoogleRating(): Promise<GoogleRatingResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Fallback: kalau env belum diset, return data default (jangan crash)
  if (!apiKey || !placeId) {
    console.warn(
      '[Google Places] API key or Place ID not configured. Returning default rating.'
    );
    return { score: 4.8, totalReviews: 0 };
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    placeId
  )}&fields=rating,user_ratings_total&key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    status: string;
    result?: { rating?: number; user_ratings_total?: number };
    error_message?: string;
  };

  if (data.status !== 'OK') {
    throw new Error(`Google Places API returned status: ${data.status} — ${data.error_message ?? ''}`);
  }

  return {
    score: data.result?.rating ?? 0,
    totalReviews: data.result?.user_ratings_total ?? 0,
  };
}
