-- Webhook idempotency hardening: duplicate Stripe deliveries must collapse
-- into one fulfillment even when they race. The code checks for an existing
-- row first, but only a UNIQUE constraint makes that check airtight.
DO $$ BEGIN
  ALTER TABLE public.payments
    ADD CONSTRAINT payments_provider_payment_id_unique UNIQUE (provider_payment_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;
