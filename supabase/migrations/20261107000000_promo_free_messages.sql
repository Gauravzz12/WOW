-- Launch promo: the first 500 Normal broadcasts are free.
-- Promo rows still carry bid_amount = BASE_NORMAL_PRICE ($5) so the
-- bid-based tier classification (Normal >= MIN_NORMAL_BID, Sponsored = $3)
-- keeps working unchanged — a free message must never be a $0 bid.
-- is_promo_free is the real marker: it drives the 500-message cap, the
-- one-per-device rule, and paid-first queue ordering.
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_promo_free boolean NOT NULL DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS device_id text;

-- Partial indexes: promo rows are a tiny minority, and both promo lookups
-- (global count, per-device check) only ever scan them.
CREATE INDEX IF NOT EXISTS idx_messages_promo ON public.messages (is_promo_free) WHERE is_promo_free;
CREATE INDEX IF NOT EXISTS idx_messages_device_promo ON public.messages (device_id) WHERE is_promo_free;
