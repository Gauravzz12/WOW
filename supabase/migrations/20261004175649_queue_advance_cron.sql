-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Create a function to invoke the queue advance
CREATE OR REPLACE FUNCTION invoke_queue_advance()
RETURNS void AS $$
DECLARE
  v_url text;
  v_secret text;
  v_headers jsonb;
BEGIN
  -- Get the API URL from database settings, fallback to words.world
  v_url := current_setting('app.settings.api_url', true);
  IF v_url IS NULL OR v_url = '' THEN
    v_url := 'https://words.world';
  END IF;

  -- Get the CRON secret from database settings (optional)
  v_secret := current_setting('app.settings.cron_secret', true);
  
  IF v_secret IS NOT NULL AND v_secret != '' THEN
    v_headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    );
  ELSE
    v_headers := jsonb_build_object('Content-Type', 'application/json');
  END IF;

  -- Call the API asynchronously via pg_net
  PERFORM net.http_post(
    url := v_url || '/api/queue/advance',
    headers := v_headers
  );
END;
$$ LANGUAGE plpgsql;

-- Remove any existing job with the same name to prevent duplicates
-- Wrap in DO block to ignore errors if it doesn't exist
DO $$
BEGIN
  PERFORM cron.unschedule('advance-message-queue');
EXCEPTION WHEN OTHERS THEN
  -- ignore
END $$;

-- Schedule the cron job to run every minute
SELECT cron.schedule(
  'advance-message-queue',
  '* * * * *',
  'SELECT invoke_queue_advance()'
);
