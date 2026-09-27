ALTER TABLE messages 
ADD COLUMN bid_amount NUMERIC DEFAULT 0,
ADD COLUMN is_reserved_slot BOOLEAN DEFAULT false;
