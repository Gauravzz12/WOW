-- Add style_config to messages for rich text formatting
ALTER TABLE messages ADD COLUMN IF NOT EXISTS style_config JSONB DEFAULT '{}';

-- Create reserved_slots table for VIP time slot booking
CREATE TABLE IF NOT EXISTS reserved_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end   TIMESTAMP WITH TIME ZONE NOT NULL,
  message_id      UUID REFERENCES messages(id) ON DELETE SET NULL,
  bid_amount      NUMERIC DEFAULT 0,
  status          TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED')),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure no two messages can book the same slot
CREATE UNIQUE INDEX IF NOT EXISTS reserved_slots_scheduled_start_booked 
  ON reserved_slots(scheduled_start) WHERE status = 'BOOKED';

-- RLS
ALTER TABLE reserved_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slots are viewable by everyone." ON reserved_slots FOR SELECT USING (true);
CREATE POLICY "Anyone can insert slots." ON reserved_slots FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update slots." ON reserved_slots FOR UPDATE USING (true);

-- Add to realtime publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE reserved_slots;
EXCEPTION WHEN duplicate_object THEN null; END $$;
