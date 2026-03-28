const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PageSpeedResult {
  score: number | null;
  isMobile: boolean;
  isHTTPS: boolean;
  isDown: boolean;
  fcp?: number;
  lcp?: number;
  cls?: number;
  tbt?: number;
  speedIndex?: number;
}

async function checkWebsiteQuality(url: string): Promise<PageSpeedResult> {
  const result: PageSpeedResult = { score: null, isMobile: false, isHTTPS: false, isDown: false };

  let normalised = url.trim();
  if (!normalised.startsWith('http://') && !normalised.startsWith('https://')) {
    normalised = 'https://' + normalised;
  }
  result.isHTTPS = normalised.startsWith('https://');

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

  try {
    const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalised)}&strategy=mobile&category=PERFORMANCE`;
    const psRes = await fetch(psUrl);
    if (psRes.ok) {
      const psData = await psRes.json();
      const perfScore = psData?.lighthouseResult?.categories?.performance?.score;
      if (perfScore !== undefined) {
        result.score = Math.round(perfScore * 100);
        result.isMobile = result.score >= 50;
      }
      const audits = psData?.lighthouseResult?.audits;
      if (audits) {
        result.fcp = audits['first-contentful-paint']?.numericValue;
        result.lcp = audits['largest-contentful-paint']?.numericValue;
        result.cls = audits['cumulative-layout-shift']?.numericValue;
        result.tbt = audits['total-blocking-time']?.numericValue;
        result.speedIndex = audits['speed-index']?.numericValue;
      }
    }
  } catch { /* ignore */ }

  return result;
}

function generateAnalysis(check: PageSpeedResult, businessCategory?: string): { analysis: string; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (check.isDown) {
    return {
      analysis: "The website is currently down or unreachable. Potential customers searching for this business will find a broken page, losing trust and revenue.",
      recommendations: [
        "Get the site back online immediately — every hour of downtime is lost business",
        "Set up uptime monitoring to catch outages early",
        "Consider a reliable hosting provider with 99.9% uptime guarantee",
      ],
    };
  }

  if (!check.isHTTPS) {
    issues.push("No SSL certificate (HTTP only) — browsers show 'Not Secure' warnings, scaring away customers");
    recommendations.push("Install an SSL certificate (free via Let's Encrypt) to enable HTTPS");
  }

  if (check.score !== null) {
    if (check.score < 30) {
      issues.push(`Extremely slow performance (score: ${check.score}/100) — most visitors will leave before the page loads`);
    } else if (check.score < 50) {
      issues.push(`Poor performance (score: ${check.score}/100) — page takes too long to become interactive`);
    }
  }

  if (check.fcp && check.fcp > 3000) {
    recommendations.push(`First paint takes ${(check.fcp / 1000).toFixed(1)}s — optimize images and reduce render-blocking resources`);
  }
  if (check.lcp && check.lcp > 4000) {
    recommendations.push(`Largest content takes ${(check.lcp / 1000).toFixed(1)}s to load — compress hero images and use modern formats (WebP)`);
  }
  if (check.tbt && check.tbt > 600) {
    recommendations.push(`Page is unresponsive for ${(check.tbt / 1000).toFixed(1)}s — reduce JavaScript and third-party scripts`);
  }
  if (check.cls && check.cls > 0.25) {
    recommendations.push("Layout shifts make the page feel janky — set explicit sizes on images and ads");
  }

  if (!check.isMobile) {
    issues.push("Not mobile-friendly — over 60% of local searches happen on phones");
    recommendations.push("Rebuild with a responsive, mobile-first design");
  }

  // Category-specific recommendations
  const cat = (businessCategory || '').toLowerCase();
  if (['restaurant', 'bakery', 'florist'].some(c => cat.includes(c))) {
    recommendations.push("Add an online menu, hours, and order/reservation buttons prominently");
  } else if (['plumber', 'electrician', 'contractor', 'landscaping', 'cleaning'].some(c => cat.includes(c))) {
    recommendations.push("Add a prominent 'Get a Quote' form and list service areas clearly");
  } else if (['dentist', 'lawyer', 'accountant'].some(c => cat.includes(c))) {
    recommendations.push("Add client testimonials, credentials, and an easy appointment booking system");
  } else if (cat.includes('salon') || cat.includes('grooming')) {
    recommendations.push("Add an online booking system and showcase work with a photo gallery");
  }

  if (recommendations.length === 0) {
    recommendations.push("Rebuild the website with modern, fast technology for better user experience");
  }

  const analysis = issues.length > 0
    ? issues.join('. ') + '.'
    : "The website has performance issues that hurt user experience and search rankings.";

  return { analysis, recommendations: recommendations.slice(0, 5) };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'Google Places API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query } = await req.json();
    if (!query || !query.trim()) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const q = query.trim();

    // Try to determine if it's a domain or a business name
    const isDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(q) || q.startsWith('http');

    let placeId: string | null = null;

    if (!isDomain) {
      // Text search by business name
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(q)}&inputtype=textquery&fields=place_id&key=${API_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (searchData.candidates?.length > 0) {
        placeId = searchData.candidates[0].place_id;
      }
    } else {
      // For domains, search with the domain as text
      let domain = q.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(domain)}&inputtype=textquery&fields=place_id&key=${API_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (searchData.candidates?.length > 0) {
        placeId = searchData.candidates[0].place_id;
      }
    }

    if (!placeId) {
      return new Response(JSON.stringify({ error: 'No business found for that query', business: null }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch place details
    const detailsFields = 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,types,business_status';
    const detailRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${detailsFields}&key=${API_KEY}`);
    const detailData = await detailRes.json();

    if (detailData.status !== 'OK' || !detailData.result) {
      return new Response(JSON.stringify({ error: 'Could not fetch business details', business: null }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const place = detailData.result;
    const addressParts = (place.formatted_address || '').split(',');
    const cityPart = addressParts[addressParts.length - 3]?.trim() || '';
    const stateZip = addressParts[addressParts.length - 2]?.trim() || '';
    const state = stateZip.split(' ')[0] || '';
    const streetAddress = addressParts.slice(0, -3).join(',').trim() || '';

    const CATEGORY_TO_TYPES: Record<string, string[]> = {
      "Restaurant": ["restaurant"], "Plumber": ["plumber"], "Electrician": ["electrician"],
      "Auto Repair": ["car_repair"], "Hair Salon": ["hair_care"], "Dentist": ["dentist"],
      "Lawyer": ["lawyer"], "Accountant": ["accounting"], "Bakery": ["bakery"],
      "Florist": ["florist"], "Dry Cleaning": ["laundry"], "Pet Grooming": ["pet_store"],
      "Landscaping": ["landscaping"], "Cleaning Service": ["cleaning_service"],
      "Contractor": ["general_contractor"],
    };

    const matchedCategory = Object.entries(CATEGORY_TO_TYPES).find(([, types]) =>
      place.types?.some((t: string) => types.includes(t))
    )?.[0] || (place.types?.[0]?.replace(/_/g, ' ') || 'Business');

    // Website analysis
    let websiteQuality: 'none' | 'poor' | 'ok' = 'none';
    let websiteScore: number | null = null;
    let websiteIssues: string[] = [];
    let websiteAnalysis: string | null = null;
    let websiteRecommendations: string[] = [];

    if (place.website) {
      const check = await checkWebsiteQuality(place.website);
      websiteScore = check.score;

      if (check.isDown) {
        websiteQuality = 'poor';
        websiteIssues.push('Site down');
      } else {
        if (!check.isHTTPS) { websiteQuality = 'poor'; websiteIssues.push('No HTTPS'); }
        if (check.score !== null && check.score < 50) { websiteQuality = 'poor'; websiteIssues.push(`Perf: ${check.score}/100`); }
        if (!check.isMobile) websiteIssues.push('Not mobile-friendly');
        if (websiteQuality !== 'poor' && websiteIssues.length === 0) websiteQuality = 'ok';
        else websiteQuality = 'poor';
      }

      if (websiteQuality === 'poor') {
        const { analysis, recommendations } = generateAnalysis(check, matchedCategory);
        websiteAnalysis = analysis;
        websiteRecommendations = recommendations;
      }
    } else {
      websiteAnalysis = "This business has no website at all. They're invisible to the majority of potential customers who search online before choosing a local service.";
      websiteRecommendations = [
        "Build a modern, mobile-responsive website with clear contact info and calls-to-action",
        "Claim and optimize their Google Business Profile",
        "Set up basic local SEO to appear in 'near me' searches",
      ];
      if (['restaurant', 'bakery'].some(c => matchedCategory.toLowerCase().includes(c))) {
        websiteRecommendations.push("Add online menu and ordering capabilities");
      } else if (['plumber', 'electrician', 'contractor'].some(c => matchedCategory.toLowerCase().includes(c))) {
        websiteRecommendations.push("Add a quote request form and list of services/service areas");
      }
    }

    // Hunter.io email lookup
    let email: string | null = null;
    const HUNTER_KEY = Deno.env.get('HUNTER_API_KEY');
    if (HUNTER_KEY && place.website) {
      try {
        let domain = place.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        const hunterUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&limit=1&api_key=${HUNTER_KEY}`;
        const hunterRes = await fetch(hunterUrl);
        if (hunterRes.ok) {
          const hunterData = await hunterRes.json();
          if (hunterData.data?.emails?.length > 0) {
            email = hunterData.data.emails[0].value;
          }
        }
      } catch { /* ignore */ }
    }

    const business = {
      id: place.place_id,
      name: place.name,
      category: matchedCategory,
      address: streetAddress,
      city: cityPart,
      state,
      phone: place.formatted_phone_number || place.international_phone_number || '',
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      hasWebsite: !!place.website,
      websiteUrl: place.website || null,
      websiteScore,
      websiteQuality,
      websiteIssues,
      websiteAnalysis,
      websiteRecommendations,
      email,
    };

    return new Response(JSON.stringify({ business }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
