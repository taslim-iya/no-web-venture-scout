-- Create outreach status enum
CREATE TYPE public.outreach_status AS ENUM ('new', 'contacted', 'in_progress', 'closed');

-- Create saved_leads table
CREATE TABLE public.saved_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  rating NUMERIC(3,1) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  status public.outreach_status NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(place_id)
);

-- Enable RLS
ALTER TABLE public.saved_leads ENABLE ROW LEVEL SECURITY;

-- Allow all operations publicly (no auth in this app)
CREATE POLICY "Allow all operations on saved_leads"
  ON public.saved_leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_saved_leads_updated_at
  BEFORE UPDATE ON public.saved_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();