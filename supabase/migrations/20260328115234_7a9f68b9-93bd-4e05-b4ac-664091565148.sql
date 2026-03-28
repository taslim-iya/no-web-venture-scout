
CREATE TABLE public.search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_key text NOT NULL UNIQUE,
  city text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'no_website',
  source text NOT NULL DEFAULT 'search',
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  result_count integer NOT NULL DEFAULT 0,
  location_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on search_cache"
  ON public.search_cache
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
