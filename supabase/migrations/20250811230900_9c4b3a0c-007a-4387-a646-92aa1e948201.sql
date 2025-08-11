-- Create table for global counters
CREATE TABLE IF NOT EXISTS public.site_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_counters ENABLE ROW LEVEL SECURITY;

-- Ensure a clean policy state then add read policy
DROP POLICY IF EXISTS "Public can read counters" ON public.site_counters;
CREATE POLICY "Public can read counters"
ON public.site_counters
FOR SELECT
USING (true);

-- RPC to increment a counter atomically (and read when delta=0)
CREATE OR REPLACE FUNCTION public.increment_counter(counter_key text, delta integer DEFAULT 1)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.site_counters (key, count)
  VALUES (counter_key, GREATEST(delta, 0))
  ON CONFLICT (key) DO UPDATE
    SET count = public.site_counters.count + EXCLUDED.count,
        updated_at = now()
  RETURNING count INTO new_count;

  IF delta = 0 THEN
    SELECT count INTO new_count FROM public.site_counters WHERE key = counter_key;
  END IF;

  RETURN new_count;
END;
$$;

-- Allow anon/auth to execute the RPC
GRANT EXECUTE ON FUNCTION public.increment_counter(text, integer) TO anon, authenticated;

-- Seed the global counter starting at 224
INSERT INTO public.site_counters (key, count)
VALUES ('global', 224)
ON CONFLICT (key) DO NOTHING;