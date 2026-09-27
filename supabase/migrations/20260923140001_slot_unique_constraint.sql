-- Add unique constraint on reserved_slots.scheduled_start (not partial) 
-- so upsert works correctly
ALTER TABLE reserved_slots 
  ADD CONSTRAINT reserved_slots_scheduled_start_unique UNIQUE (scheduled_start);
