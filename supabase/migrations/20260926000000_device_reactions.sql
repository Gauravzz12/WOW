-- Add device_id column to reactions table for anonymous device tracking
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Enforce 1 reaction per device per type per message (up to 5 total, 1 of each type)
DROP INDEX IF EXISTS reactions_device_message_idx;
CREATE UNIQUE INDEX IF NOT EXISTS reactions_device_message_type_idx 
ON public.reactions (message_id, device_id, reaction_type) 
WHERE device_id IS NOT NULL;
