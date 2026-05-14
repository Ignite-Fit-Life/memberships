insert into public.workout_programs (title, description, duration_weeks, level, is_published)
values
  ('Inner Fire 90-Day Program', 'A structured 90-day workout program for strength, energy, accountability, and consistency.', 12, 'all levels', true)
on conflict do nothing;

insert into public.classroom_lessons (title, description, category, is_published, sort_order)
values
  ('Mobility for Busy Professionals', 'Simple mobility practices to support training, work, and recovery.', 'Mobility', true, 1),
  ('Energy Basics', 'How sleep, nutrition, movement, and stress shape daily energy.', 'Energy', true, 2),
  ('Stress and Recovery', 'Practical tools for managing stress before it becomes burnout.', 'Stress', true, 3)
on conflict do nothing;

insert into public.habits (title, description, frequency, target_value, target_unit)
values
  ('Protein target', 'Hit your daily protein target.', 'daily', 1, 'target'),
  ('Steps', 'Complete your daily step target.', 'daily', 8000, 'steps'),
  ('Mobility', 'Complete your assigned mobility work.', 'daily', 10, 'minutes'),
  ('Sleep', 'Track sleep duration and quality.', 'daily', 7, 'hours'),
  ('Stress reset', 'Complete a breathwork, walk, or decompression reset.', 'daily', 1, 'reset')
on conflict do nothing;

insert into public.check_in_templates (title, description, frequency, questions)
values
  (
    'Weekly Performance Check-in',
    'Weekly review for weight, energy, sleep, stress, wins, struggles, and coach questions.',
    'weekly',
    '[
      {"key":"weight","label":"Current weight","type":"text"},
      {"key":"energy","label":"Energy this week","type":"scale"},
      {"key":"sleep","label":"Sleep quality","type":"scale"},
      {"key":"stress","label":"Stress level","type":"scale"},
      {"key":"wins","label":"Wins this week","type":"textarea"},
      {"key":"struggles","label":"What felt hard?","type":"textarea"},
      {"key":"questions","label":"Questions for Wayne","type":"textarea"}
    ]'::jsonb
  )
on conflict do nothing;

insert into public.communities (name, description, visibility)
values
  ('Inner Fire Members', 'Community for members inside the Inner Fire program.', 'cohort'),
  ('Corporate Wellness', 'Private community space for corporate wellness clients.', 'company'),
  ('Performance Coaching', 'Member discussion for training, nutrition, habits, and accountability.', 'members')
on conflict do nothing;
