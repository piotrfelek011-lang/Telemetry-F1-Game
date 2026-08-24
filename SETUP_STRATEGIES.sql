-- =============================================================
-- F1 Telemetry — tyre strategies per track (shared across seasons).
-- Run once in your Supabase SQL Editor.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.tyre_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_slot text,
  track_key text NOT NULL,                 -- slugified track name, matches across seasons
  season integer,                          -- season it was imported from (null for custom)
  name text NOT NULL,
  notes text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'custom',   -- 'race' | 'custom'
  stints jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{compound, start_lap, end_lap}]
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tyre_strategies TO authenticated;
GRANT ALL ON public.tyre_strategies TO service_role;

ALTER TABLE public.tyre_strategies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own tyre strategies" ON public.tyre_strategies;
CREATE POLICY "own tyre strategies"
  ON public.tyre_strategies
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS tyre_strategies_user_track_idx
  ON public.tyre_strategies (user_id, track_key);
