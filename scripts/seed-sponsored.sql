DELETE FROM messages WHERE bid_amount = 1.00;

INSERT INTO messages (
  category_id,
  template_id,
  content,
  status,
  bid_amount,
  is_reserved_slot,
  actual_start,
  created_at,
  style_config
) VALUES
-- 1. Love (Active)
(
  'ce92c0e4-2b74-4ccb-859e-67ef2bae34a0',
  'b',
  'To anyone feeling invisible tonight: you are loved beyond measure, even by strangers you haven''t met yet.',
  'ACTIVE',
  1.00,
  false,
  NOW() - interval '2 minutes',
  NOW() - interval '2 minutes',
  '{"bg": "bg-[#FDFBF7] dark:bg-[#1C1613]", "font": "font-serif italic", "textColor": "text-[#3D2C24] dark:text-[#F5EBE6]", "durationSecs": 1800, "sponsorName": "Elena R.", "sponsorNote": "For anyone fighting quietly in the dark 💛"}'::jsonb
),
-- 2. Gratitude (Active)
(
  'c6e7f640-fdbf-4247-a731-98e704b0b39a',
  'c',
  'A kind stranger on the 7 train returned my sketchbook today. You saved three years of memories. Thank you, New York.',
  'ACTIVE',
  1.00,
  false,
  NOW() - interval '5 minutes',
  NOW() - interval '5 minutes',
  '{"bg": "bg-[#F4F4F5] dark:bg-[#0E0E11]", "font": "font-serif", "textColor": "text-[#18181B] dark:text-[#F4F4F5]", "durationSecs": 1800, "sponsorName": "Anonymous Artist", "sponsorNote": "Artists supporting artists across borders 🎨"}'::jsonb
),
-- 3. Celebration (Active)
(
  '74edbc70-3fb5-405a-9000-6e9e3ef4d87b',
  'a',
  'Officially 1,000 days sober today. For anyone still fighting in the dark, the sunrise is worth every single step.',
  'ACTIVE',
  1.00,
  false,
  NOW() - interval '8 minutes',
  NOW() - interval '8 minutes',
  '{"bg": "bg-background", "font": "font-sans font-normal", "textColor": "text-primary", "durationSecs": 1800, "sponsorName": "Recovery Collective", "sponsorNote": "One day at a time. Keep going! 🌅"}'::jsonb
),
-- 4. Confession (Active)
(
  '476e47b1-5de5-42fa-85e2-6428fd8ab587',
  'd',
  'I quit my corporate job this morning to open a neighborhood bookstore. I am terrified, but I have never felt more alive.',
  'ACTIVE',
  1.00,
  false,
  NOW() - interval '12 minutes',
  NOW() - interval '12 minutes',
  '{"bg": "bg-[#EFF6FF] dark:bg-[#070D18]", "font": "font-sans font-light", "textColor": "text-blue-950 dark:text-blue-100", "durationSecs": 1800, "sponsorName": "Corner Books Brooklyn", "sponsorNote": "Take the leap of faith! 📚"}'::jsonb
),
-- 5. General (Active)
(
  '0f21734e-e0f1-4809-822d-5b46eee306de',
  'i',
  'Remember: breathe. You don''t have to figure out the whole rest of your life by tomorrow morning. Just take the next small step.',
  'ACTIVE',
  1.00,
  false,
  NOW() - interval '15 minutes',
  NOW() - interval '15 minutes',
  '{"bg": "bg-[#FFF1F2] dark:bg-[#200D13]", "font": "font-sans font-light", "textColor": "text-rose-950 dark:text-rose-200", "durationSecs": 1800, "sponsorName": "Mindful Living", "sponsorNote": "Pause, breathe, and be kind to yourself."}'::jsonb
),
-- 6. Announcement (Active)
(
  '6f8887bf-9091-4698-957a-2a69d5f32b85',
  'f',
  'Community garden clean-up in Kyoto this Saturday at 9 AM! Bring seeds, stories, and warm tea. Everyone is welcome.',
  'ACTIVE',
  1.00,
  false,
  NOW() - interval '18 minutes',
  NOW() - interval '18 minutes',
  '{"bg": "bg-[#EBF7EE] dark:bg-[#051109]", "font": "font-mono", "textColor": "text-[#064E22] dark:text-emerald-400", "durationSecs": 1800, "sponsorName": "Kyoto Green Initiative", "sponsorNote": "Connecting neighborhoods through nature 🌿"}'::jsonb
),
-- 7. Rant (Active)
(
  '277ce665-6d31-4181-b1a3-65b9e687bd50',
  'h',
  'Can we please normalize saying ''I don''t have the energy for this right now'' without feeling guilty? Protect your peace.',
  'ACTIVE',
  1.00,
  false,
  NOW() - interval '22 minutes',
  NOW() - interval '22 minutes',
  '{"bg": "bg-neutral-100 dark:bg-black", "font": "font-serif uppercase tracking-[0.2em]", "textColor": "text-neutral-900 dark:text-white/95", "durationSecs": 1800, "sponsorName": "Night Owl Dev", "sponsorNote": "Protect your peace and get some rest! ☕"}'::jsonb
),
-- 8. Confession (Waiting Room)
(
  '476e47b1-5de5-42fa-85e2-6428fd8ab587',
  'b',
  'I pretend to be confident around my younger siblings so they don''t lose hope, but truth is I''m just as scared as they are.',
  'PENDING_PAYMENT',
  1.00,
  false,
  null,
  NOW() - interval '25 minutes',
  '{"bg": "bg-[#FDFBF7] dark:bg-[#1C1613]", "font": "font-serif italic", "textColor": "text-[#3D2C24] dark:text-[#F5EBE6]", "durationSecs": 1800}'::jsonb
),
-- 9. Love (Waiting Room)
(
  'ce92c0e4-2b74-4ccb-859e-67ef2bae34a0',
  'a',
  'Eight years ago you chose me, and every single morning since then, I still wake up feeling like the luckiest soul on earth.',
  'PENDING_PAYMENT',
  1.00,
  false,
  null,
  NOW() - interval '20 minutes',
  '{"bg": "bg-background", "font": "font-sans font-normal", "textColor": "text-primary", "durationSecs": 1800}'::jsonb
),
-- 10. Gratitude (Waiting Room)
(
  'c6e7f640-fdbf-4247-a731-98e704b0b39a',
  'c',
  'To the oncology nurse who held my hand during chemotherapy round four: your warmth kept me breathing when medicine wasn''t enough.',
  'PENDING_PAYMENT',
  1.00,
  false,
  null,
  NOW() - interval '15 minutes',
  '{"bg": "bg-[#F4F4F5] dark:bg-[#0E0E11]", "font": "font-serif", "textColor": "text-[#18181B] dark:text-[#F4F4F5]", "durationSecs": 1800}'::jsonb
),
-- 11. Celebration (Waiting Room)
(
  '74edbc70-3fb5-405a-9000-6e9e3ef4d87b',
  'j',
  'First in my entire family to graduate college! This diploma belongs to my immigrant parents who worked three shifts so I could study.',
  'PENDING_PAYMENT',
  1.00,
  false,
  null,
  NOW() - interval '10 minutes',
  '{"bg": "bg-[#ECE6D8] dark:bg-[#151517]", "font": "font-serif text-justify", "textColor": "text-neutral-900 dark:text-neutral-100", "durationSecs": 1800}'::jsonb
);
