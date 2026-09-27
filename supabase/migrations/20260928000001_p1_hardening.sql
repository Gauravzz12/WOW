-- P1 hardening (follow-up to p0_abuse_hardening).
-- 1. Comments: device attribution for ownership deletes + rate limiting,
--    server-side length guarantee regardless of which schema revision won,
--    and revoke open direct inserts (all writes go through service-role
--    server actions now).
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Clean rows that would violate the length guarantee.
DELETE FROM public.comments WHERE content IS NULL OR btrim(content) = '';
UPDATE public.comments SET content = left(content, 300) WHERE char_length(content) > 300;

DO $$ BEGIN
  ALTER TABLE public.comments
    ADD CONSTRAINT comments_content_length
    CHECK (char_length(content) > 0 AND char_length(content) <= 300);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DROP POLICY IF EXISTS "Anyone can insert comments." ON public.comments;

-- 2. Bids must never be NULL (NULL sorts invisibly in Postgres but counts as
--    sponsored in JS comparisons, splitting queue logic in two).
UPDATE public.messages SET bid_amount = 0 WHERE bid_amount IS NULL;
ALTER TABLE public.messages ALTER COLUMN bid_amount SET DEFAULT 0;
ALTER TABLE public.messages ALTER COLUMN bid_amount SET NOT NULL;
