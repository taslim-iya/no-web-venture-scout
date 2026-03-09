const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Maps our app categories to Google Places types
const CATEGORY_TO_TYPES: Record<string, string[]> = {
  "Restaurant": ["restaurant"],
  "Plumber": ["plumber"],
  "Electrician": ["electrician"],
  "Auto Repair": ["car_repair"],
  "Hair Salon": ["hair_care"],
  "Dentist": ["dentist"],
  "Lawyer": ["lawyer"],
  "Accountant": ["accounting"],
  "Bakery": ["bakery"],
  "Florist": ["florist"],
  "Dry Cleaning": ["laundry"],
  "Pet Grooming": ["pet_store"],
  "Landscaping": ["landscaping"],
  "Cleaning Service": ["cleaning_service"],
  "Contractor": ["general_contractor"],
};

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  types?: string[];
  geometry?: {
    location: { lat: number; lng: number };
  };
  opening_hours?: { open_now: boolean };
  business_status?: string;
}

interface NearbySearchResult {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location: { lat: number; lng: number } };
  types?: string[];
  business_status?: string;
}

async function fetchAllNearbyPages(url: string, API_KEY: string): Promise<string[]> {
  const placeIds: string[] = [];
  let nextPageToken: string | undefined;
  let pageCount = 0;
  const MAX_PAGES = 3; // Google allows max 3 pages per search

  do {
    const pageUrl = nextPageToken
      ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${API_KEY}`
      : url;

    // Google requires a short delay before using pagetoken
    if (nextPageToken) {
      await new Promise((r) => setTimeout(r, 2000));
    }

    const res = await fetch(pageUrl);
    const data = await res.json();

    if (data.status === 'OK' && data.results) {
      for (const place of data.results as NearbySearchResult[]) {
        if (place.place_id && !placeIds.includes(place.place_id)) {
          placeIds.push(place.place_id);
        }
      }
    }

    nextPageToken = data.next_page_token;
    pageCount++;
  } while (nextPageToken && pageCount < MAX_PAGES);

  return placeIds;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { city, category } = await req.json();

    if (!city || !city.trim()) {
      return new Response(
        JSON.stringify({ error: 'City is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Geocode the city to get lat/lng
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${API_KEY}`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
      console.error('Geocode failed:', geocodeData.status, geocodeData.error_message);
      return new Response(
        JSON.stringify({ error: `Could not find location: ${city}. Geocode status: ${geocodeData.status}${geocodeData.error_message ? ' — ' + geocodeData.error_message : ''}`, businesses: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    const locationName = geocodeData.results[0].formatted_address;

    // Determine which types to search
    const selectedTypes = category && category !== 'All Categories'
      ? CATEGORY_TO_TYPES[category] || [category.toLowerCase().replace(/ /g, '_')]
      : Object.values(CATEGORY_TO_TYPES).flat().slice(0, 8); // broader search for all categories

    // Step 2: Search for businesses using Nearby Search with pagination (up to 3 pages = 60 results per type)
    const placeIds: string[] = [];
    const radius = 15000; // 15km

    // Search all selected types (no slice limit)
    for (const type of selectedTypes) {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${API_KEY}`;
      const ids = await fetchAllNearbyPages(nearbyUrl, API_KEY);
      for (const id of ids) {
        if (!placeIds.includes(id)) placeIds.push(id);
      }
      // Stop if we already have way more than needed to find 200 without websites
      if (placeIds.length >= 600) break;
    }

    if (placeIds.length === 0) {
      return new Response(
        JSON.stringify({ businesses: [], location: locationName }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Fetch details for each place, filter those WITHOUT a website
    const businesses = [];
    // Note: Google Places API does not expose email directly; we request all available contact fields
    const detailsFields = 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,types,business_status';

    // Process in parallel batches of 10
    const BATCH_SIZE = 10;
    const MAX_RESULTS = 200;

    for (let i = 0; i < placeIds.length && businesses.length < MAX_RESULTS; i += BATCH_SIZE) {
      const batch = placeIds.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((placeId) =>
        fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${detailsFields}&key=${API_KEY}`)
          .then((r) => r.json())
      );

      const batchResults = await Promise.all(batchPromises);

      for (const detailData of batchResults) {
        if (businesses.length >= MAX_RESULTS) break;
        if (detailData.status !== 'OK' || !detailData.result) continue;

        const place = detailData.result as PlaceResult;

        // Only include businesses WITHOUT a website
        if (place.website) continue;

        // Skip permanently closed businesses
        if (place.business_status === 'CLOSED_PERMANENTLY') continue;

        // Extract city/state from formatted_address
        const addressParts = (place.formatted_address || '').split(',');
        const cityPart = addressParts[addressParts.length - 3]?.trim() || '';
        const stateZip = addressParts[addressParts.length - 2]?.trim() || '';
        const state = stateZip.split(' ')[0] || '';
        const streetAddress = addressParts.slice(0, -3).join(',').trim() || place.vicinity || '';

        // Map Google types to our category
        const matchedCategory = Object.entries(CATEGORY_TO_TYPES).find(([, types]) =>
          place.types?.some((t) => types.includes(t))
        )?.[0] || (place.types?.[0]?.replace(/_/g, ' ') || 'Business');

        businesses.push({
          id: place.place_id,
          name: place.name,
          category: matchedCategory,
          address: streetAddress,
          city: cityPart,
          state,
          phone: place.formatted_phone_number || place.international_phone_number || '',
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          hasWebsite: false,
          email: null, // Google Places API does not provide email addresses
        });
      }
    }

    return new Response(
      JSON.stringify({ businesses, location: locationName, total: businesses.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
