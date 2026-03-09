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
      return new Response(
        JSON.stringify({ error: `Could not find location: ${city}`, businesses: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    const locationName = geocodeData.results[0].formatted_address;

    // Determine which types to search
    const selectedTypes = category && category !== 'All Categories'
      ? CATEGORY_TO_TYPES[category] || [category.toLowerCase().replace(/ /g, '_')]
      : Object.values(CATEGORY_TO_TYPES).flat().slice(0, 5); // limit for all-categories

    // Step 2: Search for businesses using Nearby Search
    const placeIds: string[] = [];
    const radius = 15000; // 15km

    for (const type of selectedTypes.slice(0, 3)) {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${API_KEY}`;
      const nearbyRes = await fetch(nearbyUrl);
      const nearbyData = await nearbyRes.json();

      if (nearbyData.status === 'OK' && nearbyData.results) {
        for (const place of nearbyData.results as NearbySearchResult[]) {
          if (place.place_id && !placeIds.includes(place.place_id)) {
            placeIds.push(place.place_id);
          }
        }
      }
    }

    if (placeIds.length === 0) {
      return new Response(
        JSON.stringify({ businesses: [], location: locationName }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Fetch details for each place, filter those WITHOUT a website
    const businesses = [];
    const detailsFields = 'place_id,name,formatted_address,formatted_phone_number,rating,user_ratings_total,website,types,business_status';

    // Process in parallel batches of 5 to avoid rate limits
    const BATCH_SIZE = 5;
    const MAX_RESULTS = 40;

    for (let i = 0; i < Math.min(placeIds.length, MAX_RESULTS); i += BATCH_SIZE) {
      const batch = placeIds.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((placeId) =>
        fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${detailsFields}&key=${API_KEY}`)
          .then((r) => r.json())
      );

      const batchResults = await Promise.all(batchPromises);

      for (const detailData of batchResults) {
        if (detailData.status !== 'OK' || !detailData.result) continue;

        const place = detailData.result as PlaceResult;

        // Only include businesses WITHOUT a website
        if (place.website) continue;

        // Skip permanently closed businesses
        if (place.business_status === 'CLOSED_PERMANENTLY') continue;

        // Extract city/state from formatted_address
        const addressParts = (place.formatted_address || '').split(',');
        const city = addressParts[addressParts.length - 3]?.trim() || '';
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
          city,
          state,
          phone: place.formatted_phone_number || '',
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          hasWebsite: false,
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
