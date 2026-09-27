-- Drop NOT NULL constraint for user_id
ALTER TABLE messages ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE reactions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;

-- Drop RLS policies that restrict INSERT to authenticated users
DROP POLICY IF EXISTS "Authenticated users can insert messages." ON messages;
DROP POLICY IF EXISTS "Authenticated users can insert comments." ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert reactions." ON reactions;
DROP POLICY IF EXISTS "Users can insert own payments." ON payments;

-- Create open RLS policies for anonymous insertions
CREATE POLICY "Anyone can insert messages." ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert comments." ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert reactions." ON reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert payments." ON payments FOR INSERT WITH CHECK (true);

-- Drop UNIQUE constraint on reactions to allow infinite anonymous reactions
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_user_id_message_id_reaction_type_key;
