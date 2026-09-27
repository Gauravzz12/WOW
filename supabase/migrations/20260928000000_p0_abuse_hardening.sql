-- P0 abuse hardening (pre-launch).
-- 1. Reactions: purge unattributable rows, require device_id, close open write policies.
--    All reaction writes go through service-role server actions that verify the
--    device cookie, so anon direct INSERT/DELETE must be revoked.

-- Remove rows that can never be attributed to a device (spam-prone).
DELETE FROM public.reactions WHERE device_id IS NULL;

-- Device attribution is mandatory from here on.
ALTER TABLE public.reactions ALTER COLUMN device_id SET NOT NULL;

-- Revoke open write access (SELECT stays public so counts remain visible).
DROP POLICY IF EXISTS "Anyone can insert reactions." ON public.reactions;
DROP POLICY IF EXISTS "Anyone can delete reactions by id" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions." ON public.reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.reactions;

-- 2. Sponsor shoutout edit tokens (service-role only: RLS enabled, no anon policies).
--    Issued at sponsorship time; the raw token lives in the sponsor's httpOnly
--    cookie and only its SHA-256 hash is stored here.
CREATE TABLE IF NOT EXISTS public.sponsor_edit_tokens (
  message_id UUID PRIMARY KEY REFERENCES public.messages(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT now() + interval '30 days' NOT NULL
);
ALTER TABLE public.sponsor_edit_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Private reminder_email column. Reminder addresses were stored inside the
--    publicly-readable style_config JSONB; move them to a dedicated column that
--    anon-facing queries never select, then strip the key from JSONB.
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reminder_email TEXT;

UPDATE public.messages
SET reminder_email = COALESCE(reminder_email, style_config->>'reminderEmail')
WHERE jsonb_typeof(style_config) = 'object' AND style_config ? 'reminderEmail';

UPDATE public.messages
SET style_config = style_config - 'reminderEmail'
WHERE jsonb_typeof(style_config) = 'object' AND style_config ? 'reminderEmail';
