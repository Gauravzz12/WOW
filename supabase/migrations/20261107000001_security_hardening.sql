-- Security hardening (2026-11-07 audit, run-1).
-- Closes the anonymous-write RLS policies left over from the anonymous
-- architecture migration, enforces the promo cap atomically, and stops
-- PII columns on messages from being readable by the anon role.
-- APPLY TOGETHER WITH 20261107000000_promo_free_messages.sql, BEFORE
-- deploying the matching code: the unique indexes below assume no promo
-- rows exist yet (true while the promo has never run in production).

-- 1. DAT-1: anyone holding the public anon key could INSERT arbitrary
--    messages rows (status ACTIVE, any bid) via PostgREST, bypassing
--    payment, moderation and sanitization. All creates go through the
--    service-role createMessage action; anon needs no INSERT.
DROP POLICY IF EXISTS "Anyone can insert messages." ON public.messages;

-- 2. DAT-2: anon could INSERT/UPDATE reserved_slots (flip BOOKED slots
--    back to AVAILABLE, or mark the whole inventory BOOKED). Slot reads
--    stay public; all writes are service-role (cron + checkout).
DROP POLICY IF EXISTS "Anyone can insert slots." ON public.reserved_slots;
DROP POLICY IF EXISTS "Anyone can update slots." ON public.reserved_slots;

-- 3. DAT-9: anon INSERT on payments could pre-seed a dedup row and block
--    a real webhook activation for that provider_payment_id. Webhooks
--    write via the service role only.
DROP POLICY IF EXISTS "Anyone can insert payments." ON public.payments;

-- 4. Defense in depth for DAT-1: messages.status was free text. Pin it
--    to the values the application actually writes (REJECTED is never
--    written today but is part of the promo counting contract).
ALTER TABLE public.messages
  ADD CONSTRAINT messages_status_check
  CHECK (status IN ('DRAFT', 'PENDING_PAYMENT', 'QUEUED', 'ACTIVE',
                    'COMPLETED', 'EXPIRED', 'REJECTED'));

-- 5. CRE-4: promo eligibility was count-then-insert with no constraint —
--    parallel creates overshot the 500 cap and the per-device rule.
--    Atomic counter: claim_promo_slot() increments only while claimed <
--    500 inside a single UPDATE, so concurrent claims cannot overshoot.
CREATE TABLE IF NOT EXISTS public.promo_counter (
  id integer PRIMARY KEY CHECK (id = 1),
  claimed integer NOT NULL DEFAULT 0 CHECK (claimed >= 0)
);
INSERT INTO public.promo_counter (id, claimed)
SELECT 1, count(*) FROM public.messages
WHERE is_promo_free AND status <> 'REJECTED'
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.promo_counter ENABLE ROW LEVEL SECURITY;
-- No policies: only the SECURITY DEFINER functions below (and the
-- service role) can touch the counter.

CREATE OR REPLACE FUNCTION public.claim_promo_slot()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.promo_counter
  SET claimed = claimed + 1
  WHERE id = 1 AND claimed < 500
  RETURNING true;
$$;

CREATE OR REPLACE FUNCTION public.release_promo_slot()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.promo_counter
  SET claimed = claimed - 1
  WHERE id = 1 AND claimed > 0;
$$;

-- 6. CRE-4 (device half): one promo row per device, enforced by the DB.
--    A racing second insert fails with a unique violation and the
--    create action treats it as ineligible (falls through to paid).
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_promo_device_unique
  ON public.messages (device_id)
  WHERE is_promo_free AND device_id IS NOT NULL;

-- 7. CRE-5 (mitigation): one promo row per reminder email as a second
--    identity signal next to the (spoofable) device id. The 500 cap
--    above remains the hard bound.
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_promo_email_unique
  ON public.messages (lower(reminder_email))
  WHERE is_promo_free AND reminder_email IS NOT NULL;

-- 8. DAT-6 / API-7 defense: reminder_email and device_id on messages are
--    written by service-role paths only and no anon-facing query selects
--    them. Revoke them at the column level so a policy slip cannot leak
--    poster emails through PostgREST.
REVOKE SELECT (reminder_email, device_id) ON public.messages FROM anon, authenticated;

-- 9. DAT-3: device_id on comments/reactions was both broadcast in public
--    selects and used as the ownership credential. Ownership is now
--    resolved server-side (cookie device id -> own row ids); clients no
--    longer select the column, so revoke it there too.
REVOKE SELECT (device_id) ON public.comments FROM anon, authenticated;
REVOKE SELECT (device_id) ON public.reactions FROM anon, authenticated;
