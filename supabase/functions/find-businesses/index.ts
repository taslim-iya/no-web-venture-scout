const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

type WebsiteQuality = "none" | "poor" | "ok";

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

interface PageSpeedResult {
  score: number | null;
  isMobile: boolean;
  isHTTPS: boolean;
  isDown: boolean;
}

async function checkWebsiteQuality(url: string): Promise<PageSpeedResult> {
  const result: PageSpeedResult = { score: null, isMobile: false, isHTTPS: false, isDown: false };

  // Normalise URL
  let normalised = url.trim();
  if (!normalised.startsWith('http://') && !normalised.startsWith('https://')) {
    normalised = 'https://' + normalised;
  }
  result.isHTTPS = normalised.startsWith('https://');

  // Quick liveness check (5s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(normalised, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeoutId);
    if (!res.ok && res.status >= 400) {
      result.isDown = true;
      return result;
    }
  } catch {
    result.isDown = true;
    return result;
  }

  // PageSpeed Insights (free public API, no key required for basic usage)
  try {
    const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalised)}&strategy=mobile&category=PERFORMANCE`;
    const psRes = await fetch(psUrl);
    if (psRes.ok) {
      const psData = await psRes.json();
      const perfScore: number | undefined = psData?.lighthouseResult?.categories?.performance?.score;
      if (perfScore !== undefined) {
        result.score = Math.round(perfScore * 100);
        result.isMobile = result.score >= 50;
      }
    }
  } catch {
    // PageSpeed check failed — we still have liveness info
  }

  return result;
}

function websiteQualityLabel(check: PageSpeedResult): WebsiteQuality {
  if (check.isDown) return "poor";
  if (check.score !== null && check.score < 50) return "poor";
  if (!check.isHTTPS) return "poor";
  return "ok";
}

function generateAnalysis(check: PageSpeedResult, businessCategory?: string): { analysis: string; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (check.isDown) {
    return {
      analysis: "Website is down or unreachable — potential customers see a broken page.",
      recommendations: [
        "Get the site back online immediately",
        "Set up uptime monitoring",
        "Consider reliable hosting with 99.9% uptime",
      ],
    };
  }

  if (!check.isHTTPS) {
    issues.push("No SSL (HTTP only) — browsers show 'Not Secure' warnings");
    recommendations.push("Install an SSL certificate to enable HTTPS");
  }
  if (check.score !== null && check.score < 50) {
    issues.push(`Poor performance (${check.score}/100)`);
    recommendations.push("Optimize images, reduce scripts, and improve server response time");
  }
  if (!check.isMobile) {
    issues.push("Not mobile-friendly");
    recommendations.push("Rebuild with a responsive, mobile-first design");
  }

  const cat = (businessCategory || '').toLowerCase();
  if (['restaurant', 'bakery', 'florist'].some(c => cat.includes(c))) {
    recommendations.push("Add online menu, hours, and ordering buttons");
  } else if (['plumber', 'electrician', 'contractor', 'landscaping', 'cleaning'].some(c => cat.includes(c))) {
    recommendations.push("Add a 'Get a Quote' form and list service areas");
  } else if (['dentist', 'lawyer', 'accountant'].some(c => cat.includes(c))) {
    recommendations.push("Add testimonials, credentials, and online booking");
  } else if (cat.includes('salon') || cat.includes('grooming')) {
    recommendations.push("Add online booking and a photo gallery");
  }

  return {
    analysis: issues.length > 0 ? issues.join('. ') + '.' : "Site has issues hurting UX and search rankings.",
    recommendations: recommendations.slice(0, 4),
  };
}

async function fetchAllNearbyPages(url: string, API_KEY: string): Promise<string[]> {
  const placeIds: string[] = [];
  let nextPageToken: string | undefined;
  let pageCount = 0;
  const MAX_PAGES = 3;

  do {
    const pageUrl = nextPageToken
      ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${API_KEY}`
      : url;

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

    // mode: "no_website" | "poor_website" | "both"
    const { city, category, mode = 'no_website' } = await req.json();

    if (!city || !city.trim()) {
      return new Response(
        JSON.stringify({ error: 'City is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Geocode
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${API_KEY}`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
      return new Response(
        JSON.stringify({ error: `Could not find location: ${city}. Geocode status: ${geocodeData.status}`, businesses: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    const locationName = geocodeData.results[0].formatted_address;

    const selectedTypes = category && category !== 'All Categories'
      ? CATEGORY_TO_TYPES[category] || [category.toLowerCase().replace(/ /g, '_')]
      : Object.values(CATEGORY_TO_TYPES).flat().slice(0, 8);

    // Step 2: Nearby search
    const placeIds: string[] = [];
    const radius = 15000;

    for (const type of selectedTypes) {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${API_KEY}`;
      const ids = await fetchAllNearbyPages(nearbyUrl, API_KEY);
      for (const id of ids) {
        if (!placeIds.includes(id)) placeIds.push(id);
      }
      if (placeIds.length >= 600) break;
    }

    if (placeIds.length === 0) {
      return new Response(
        JSON.stringify({ businesses: [], location: locationName }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Fetch place details
    const businesses = [];
    const detailsFields = 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,types,business_status';
    const BATCH_SIZE = 10;
    const MAX_RESULTS = 200;

    for (let i = 0; i < placeIds.length && businesses.length < MAX_RESULTS; i += BATCH_SIZE) {
      const batch = placeIds.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((placeId) =>
        fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${detailsFields}&key=${API_KEY}`)
          .then((r) => r.json())
      );

      const batchResults = await Promise.all(batchPromises);

      // For poor_website mode, check PageSpeed in parallel for places that have websites
      const poorWebsiteChecks: Promise<{ placeResult: PlaceResult; check: PageSpeedResult } | null>[] = [];

      for (const detailData of batchResults) {
        if (detailData.status !== 'OK' || !detailData.result) continue;
        const place = detailData.result as PlaceResult;
        if (place.business_status === 'CLOSED_PERMANENTLY') continue;

        if (!place.website) {
          // No website — include if mode is "no_website" or "both"
          if (mode === 'no_website' || mode === 'both') {
            const addressParts = (place.formatted_address || '').split(',');
            const cityPart = addressParts[addressParts.length - 3]?.trim() || '';
            const stateZip = addressParts[addressParts.length - 2]?.trim() || '';
            const state = stateZip.split(' ')[0] || '';
            const streetAddress = addressParts.slice(0, -3).join(',').trim() || place.vicinity || '';

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
              websiteUrl: null,
              websiteScore: null,
              websiteQuality: 'none' as WebsiteQuality,
              email: null,
            });
          }
        } else if (mode === 'poor_website' || mode === 'both') {
          // Has a website — queue quality check
          poorWebsiteChecks.push(
            checkWebsiteQuality(place.website).then((check) => ({ placeResult: place, check }))
          );
        }
      }

      // Resolve poor website checks
      if (poorWebsiteChecks.length > 0) {
        const resolved = await Promise.all(poorWebsiteChecks);
        for (const item of resolved) {
          if (!item) continue;
          if (businesses.length >= MAX_RESULTS) break;
          const { placeResult: place, check } = item;
          const quality = websiteQualityLabel(check);
          if (quality !== 'poor') continue; // Skip sites that are fine

          const addressParts = (place.formatted_address || '').split(',');
          const cityPart = addressParts[addressParts.length - 3]?.trim() || '';
          const stateZip = addressParts[addressParts.length - 2]?.trim() || '';
          const state = stateZip.split(' ')[0] || '';
          const streetAddress = addressParts.slice(0, -3).join(',').trim() || place.vicinity || '';

          const matchedCategory = Object.entries(CATEGORY_TO_TYPES).find(([, types]) =>
            place.types?.some((t) => types.includes(t))
          )?.[0] || (place.types?.[0]?.replace(/_/g, ' ') || 'Business');

          const issueLabels: string[] = [];
          if (check.isDown) issueLabels.push('Site down');
          else {
            if (!check.isHTTPS) issueLabels.push('No HTTPS');
            if (check.score !== null && check.score < 50) issueLabels.push(`Perf: ${check.score}/100`);
          }

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
            hasWebsite: true,
            websiteUrl: place.website || null,
            websiteScore: check.score,
            websiteQuality: 'poor' as WebsiteQuality,
            websiteIssues: issueLabels,
            email: null,
          });
        }
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
