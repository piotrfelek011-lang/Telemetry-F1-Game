-- =============================================================
-- F1 Telemetry — custom names for career slots.
-- Run once in your Supabase SQL Editor (after SETUP_CAREERS.sql).
-- =============================================================

CREATE TABLE IF NOT EXISTS public.career_slot_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id text NOT NULL,
  name text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slot_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_slot_names TO authenticated;
GRANT ALL ON public.career_slot_names TO service_role;

ALTER TABLE public.career_slot_names ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own career slot names" ON public.career_slot_names;
CREATE POLICY "own career slot names"
  ON public.career_slot_names
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
