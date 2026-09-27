-- Drop previous DELETE policy which restricted it to auth users
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.reactions;

-- Allow anonymous users to delete reactions (since they need the unguessable UUID to do so)
CREATE POLICY "Anyone can delete reactions by id" ON public.reactions FOR DELETE USING (true);

-- Create RPC function to fetch leaderboard (Top 50 most reacted posts)
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  style_config JSONB,
  reaction_count BIGINT,
  category_name TEXT,
  category_slug TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id, 
    m.content, 
    m.created_at, 
    m.style_config, 
    COUNT(r.id) as reaction_count,
    c.name as category_name,
    c.slug as category_slug
  FROM public.messages m
  LEFT JOIN public.reactions r ON m.id = r.message_id
  LEFT JOIN public.categories c ON m.category_id = c.id
  WHERE m.status != 'PENDING_PAYMENT'
  GROUP BY m.id, c.id
  ORDER BY reaction_count DESC, m.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
