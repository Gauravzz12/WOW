INSERT INTO categories (slug, name, description, base_price, base_duration, max_duration) VALUES
('love', 'Love', 'Romance, affection, declarations.', 3.00, 600, 3600),
('celebration', 'Celebration', 'Birthdays, achievements, weddings, milestones.', 3.00, 600, 3600),
('confession', 'Confession', 'Things people want to finally say.', 3.00, 600, 3600),
('gratitude', 'Gratitude', 'Thank-you messages and appreciation.', 3.00, 600, 3600),
('announcement', 'Announcement', 'Important news, launches, or statements.', 3.00, 600, 3600),
('promotion', 'Promotion', 'Brand launches, startups, products & creative showcases.', 3.00, 600, 3600),
('rant', 'Rant', 'Speak raw truth without sugarcoating. Let off steam.', 3.00, 600, 1800),
('general', 'General', 'Any other message to the world.', 3.00, 600, 3600)
ON CONFLICT (slug) DO UPDATE SET 
name = EXCLUDED.name, 
description = EXCLUDED.description;

-- Remove the old niche ones
DELETE FROM categories WHERE slug IN ('heartbreak', 'proposal', 'awareness', 'tribute');
