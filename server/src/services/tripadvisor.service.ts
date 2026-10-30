/**
 * TripAdvisor Content API service
 * Docs: https://tripadvisor-content-api.readme.io/reference/overview
 *
 * Required env:
 *   TRIPADVISOR_API_KEY
 *   TRIPADVISOR_LOCATION_ID
 *
 * Catatan: TripAdvisor butuh IP whitelist di dashboard mereka.
 * Kalau API belum aktif, endpoint sync akan return data default.
 */

interface TripAdvisorRatingResult {
  score: number;
  totalReviews: number;
}

export async function fetchTripAdvisorRating(): Promise<TripAdvisorRatingResult> {
  const apiKey = process.env.TRIPADVISOR_API_KEY;
  const locationId = process.env.TRIPADVISOR_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn(
      '[TripAdvisor] API key or Location ID not configured. Returning default rating.'
    );
    return { score: 4.7, totalReviews: 0 };
  }

  const url = `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(
    locationId
  )}/details?key=${encodeURIComponent(apiKey)}&language=en`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `TripAdvisor API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as {
    rating?: string;
    num_reviews?: string;
  };

  return {
    score: data.rating ? parseFloat(data.rating) : 0,
    totalReviews: data.num_reviews ? parseInt(data.num_reviews, 10) : 0,
  };
}
