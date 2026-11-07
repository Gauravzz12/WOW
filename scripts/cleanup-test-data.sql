-- ============================================================================
-- Cleanup: remove test / seed / duplicate messages from PRODUCTION.
--
-- REVIEW-FIRST SCRIPT. Nothing here runs until you paste it into the
-- Supabase SQL editor yourself. Step 1 only SELECTs — run it, eyeball the
-- rows, and only then run Step 2 / Step 3 inside the transaction.
--
-- Safety rules baked in:
--   * A message that has ANY row in `payments` is never deleted.
--   * Deletes are wrapped in a transaction — COMMIT only when the counts
--     look right, otherwise ROLLBACK.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STEP 1 — PREVIEW (read-only). Run this first.
-- ---------------------------------------------------------------------------

-- 1a. Obvious test/debug content
SELECT id, status, created_at, left(content, 80) AS content_preview
FROM messages m
WHERE (
    content ILIKE '%test message%'
    OR content ILIKE '%Sponsored Test Message%'
    OR content ILIKE '%Normal Test Message%'
    OR content ILIKE '%debugging%'
    OR content ILIKE '%automated test%'
    OR trim(content) ILIKE 'cocaine'
  )
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.message_id = m.id)
ORDER BY created_at;

-- 1b. Exact duplicates (same content + category posted more than once,
--     e.g. the category starter texts seeded repeatedly). Earliest copy is
--     the one Step 3 would keep.
SELECT content, category_id, count(*) AS copies, min(created_at) AS first_seen
FROM messages m
WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.message_id = m.id)
GROUP BY content, category_id
HAVING count(*) > 1
ORDER BY copies DESC;

-- ---------------------------------------------------------------------------
-- STEP 2 — Delete test/debug content (no payments). Run only after Step 1a
-- looks right.
-- ---------------------------------------------------------------------------
BEGIN;

DELETE FROM messages m
WHERE (
    content ILIKE '%test message%'
    OR content ILIKE '%Sponsored Test Message%'
    OR content ILIKE '%Normal Test Message%'
    OR content ILIKE '%debugging%'
    OR content ILIKE '%automated test%'
    OR trim(content) ILIKE 'cocaine'
  )
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.message_id = m.id);

-- Check the affected-row count Supabase reports. If it matches Step 1a:
--   COMMIT;
-- If anything looks wrong:
--   ROLLBACK;

-- ---------------------------------------------------------------------------
-- STEP 3 — Dedupe: keep the earliest copy of each (content, category),
-- delete later unpaid copies. Run in its own transaction, after Step 1b.
-- ---------------------------------------------------------------------------
BEGIN;

DELETE FROM messages m
USING (
  SELECT id,
         row_number() OVER (
           PARTITION BY content, category_id ORDER BY created_at ASC
         ) AS rn
  FROM messages
  WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.message_id = messages.id)
) dup
WHERE m.id = dup.id AND dup.rn > 1;

-- Verify with the Step 1b query again (should return no rows), then COMMIT;
-- or ROLLBACK if the counts surprise you.

-- ---------------------------------------------------------------------------
-- NOTES
-- * Reactions/comments referencing deleted messages: check your FK setup.
--   If reactions/comments have ON DELETE CASCADE they go with the message;
--   if not, this delete will fail loudly rather than orphan rows — in that
--   case delete child rows for the same ids first, inside the transaction.
-- * After cleanup, the leaderboard (get_leaderboard RPC) re-ranks from real
--   data automatically.
-- * Prevention: /api/setup-test-data has been removed from the codebase and
--   the seed scripts no longer carry hardcoded credentials. Do not re-run
--   scripts/seed-*.js against the production project.
-- ============================================================================
