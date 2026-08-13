-- =============================================================
-- F1 Telemetry — career slots + notes-save fix.
-- Run this once in your Supabase SQL Editor (after SETUP_AUTH.sql).
-- =============================================================

-- 1) Career slots: 'driver-1'..'driver-3' and 'team-1'..'team-3'
ALTER TABLE public.telemetry_sessions
  ADD COLUMN IF NOT EXISTS career_slot text;

CREATE INDEX IF NOT EXISTS telemetry_sessions_career_slot_idx
  ON public.telemetry_sessions(user_id, career_slot);

-- 2) Move every existing session into "My Team · Slot 1"
UPDATE public.telemetry_sessions
   SET career_slot = 'team-1'
 WHERE career_slot IS NULL;

-- 3) Notes save fix — track_notes must be unique PER USER, not globally.
--    A global unique/primary key on track_key makes the second account's
--    (or a legacy row's) insert fail with a duplicate-key error, which is why
--    saving notes worked on some tracks and failed on others.
ALTER TABLE public.track_notes
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

DO $$
DECLARE c text;
BEGIN
  -- Drop any unique/primary constraint that is on track_key alone.
  FOR c IN
    SELECT con.conname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
     WHERE rel.relname = 'track_notes'
       AND con.contype IN ('p','u')
       AND (SELECT array_agg(att.attname ORDER BY att.attname)
              FROM unnest(con.conkey) k
              JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = k)
           = ARRAY['track_key']
  LOOP
    EXECUTE format('ALTER TABLE public.track_notes DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

-- De-duplicate before adding the per-user unique key.
DELETE FROM public.track_notes a
 USING public.track_notes b
 WHERE a.ctid < b.ctid
   AND a.track_key = b.track_key
   AND a.user_id IS NOT DISTINCT FROM b.user_id;

CREATE UNIQUE INDEX IF NOT EXISTS track_notes_user_track_uidx
  ON public.track_notes(user_id, track_key);
