-- Lock unpaid sponsored messages: anon clients must never read full PENDING_PAYMENT content.
-- Server code uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) to fetch + mask teasers.
-- Public clients only see paid messages (QUEUED / ACTIVE / COMPLETED / etc.).

DROP POLICY IF EXISTS "Messages are viewable by everyone." ON public.messages;

-- Paid / live / archived messages remain publicly readable.
CREATE POLICY "Public can view paid messages."
ON public.messages FOR SELECT
USING (status IS DISTINCT FROM 'PENDING_PAYMENT');

-- NOTE: no SELECT policy for PENDING_PAYMENT on anon/authenticated roles,
-- so direct anon queries for unpaid rows return 0 rows. Service role bypasses RLS.
