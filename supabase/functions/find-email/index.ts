const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HUNTER_API_KEY = Deno.env.get('HUNTER_API_KEY');
    if (!HUNTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Hunter.io API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { businessName, city, state } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: 'businessName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build a domain guess from the business name
    // e.g. "Joe's Pizza" -> "joespizza.com"
    const domainGuess = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      + '.com';

    // Try Hunter.io domain search first
    const domainSearchUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domainGuess)}&company=${encodeURIComponent(businessName)}&api_key=${HUNTER_API_KEY}&limit=5`;
    const domainRes = await fetch(domainSearchUrl);
    const domainData = await domainRes.json();

    if (domainData.data?.emails?.length > 0) {
      const topEmail = domainData.data.emails[0];
      return new Response(
        JSON.stringify({
          email: topEmail.value,
          confidence: topEmail.confidence,
          domain: domainData.data.domain,
          source: 'domain-search',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: try Hunter.io company search using business name + location
    const companyQuery = city ? `${businessName} ${city}` : businessName;
    const companyUrl = `https://api.hunter.io/v2/domain-search?company=${encodeURIComponent(companyQuery)}&api_key=${HUNTER_API_KEY}&limit=5`;
    const companyRes = await fetch(companyUrl);
    const companyData = await companyRes.json();

    if (companyData.data?.emails?.length > 0) {
      const topEmail = companyData.data.emails[0];
      return new Response(
        JSON.stringify({
          email: topEmail.value,
          confidence: topEmail.confidence,
          domain: companyData.data.domain,
          source: 'company-search',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No email found
    return new Response(
      JSON.stringify({ email: null, message: 'No email found via Hunter.io' }),
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
