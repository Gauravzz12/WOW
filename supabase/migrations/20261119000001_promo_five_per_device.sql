-- Promo per-device cap raised from 1 to 5 (owner decision, 2026-11-19).
--
-- Migration 20261107000001 (item 6, CRE-4 device half) enforced one promo
-- row per device with a UNIQUE partial index. That index makes any cap
-- above one impossible at the DB level, so it is dropped here. The cap is
-- now enforced by the create action's device count check
-- (PROMO_PER_DEVICE_LIMIT in src/lib/constants/pricing.ts) as a fast path;
-- the global 500 cap stays hard-enforced by the atomic claim_promo_slot()
-- counter. The email unique index (CRE-5) is unchanged: still one promo
-- row per reminder email.
--
-- A plain (non-unique) partial index replaces it so the per-device count
-- queries in the create action and /api/promo/status stay indexed.

DROP INDEX IF EXISTS public.idx_messages_promo_device_unique;

CREATE INDEX IF NOT EXISTS idx_messages_promo_device
  ON public.messages (device_id)
  WHERE is_promo_free AND device_id IS NOT NULL;
