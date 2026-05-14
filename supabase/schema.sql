create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'member' check (role in ('member', 'admin', 'coach')),
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('inactive', 'active', 'trialing', 'past_due', 'cancelled')),
  tier text not null default 'inner_fire',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.workout_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration_weeks integer not null default 12,
  level text not null default 'all levels',
  cover_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.workout_programs(id) on delete cascade,
  week_number integer not null,
  title text not null,
  description text
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.program_weeks(id) on delete cascade,
  title text not null,
  description text,
  day_number integer not null,
  estimated_minutes integer,
  video_url text
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  title text not null,
  instructions text,
  demo_video_url text,
  sets integer,
  reps text,
  prescribed_weight text,
  prescribed_rpe numeric(3,1),
  tempo text,
  rest_seconds integer,
  video_url text,
  coaching_cues text,
  substitutions text,
  sort_order integer not null default 0
);

create table if not exists public.workout_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  completed_at timestamptz not null default now(),
  notes text,
  unique(user_id, workout_id)
);

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  performed_at timestamptz not null default now(),
  set_number integer,
  actual_reps text,
  actual_weight text,
  actual_rpe numeric(3,1),
  notes text
);

create table if not exists public.classroom_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  video_url text,
  thumbnail_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  visibility text not null default 'members' check (visibility in ('members', 'private', 'company', 'cohort')),
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator', 'admin')),
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_reactions (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, reaction)
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  target_value numeric,
  target_unit text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  starts_on date not null default current_date,
  ends_on date,
  is_active boolean not null default true,
  unique(user_id, habit_id)
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  logged_on date not null default current_date,
  value numeric,
  completed boolean not null default false,
  notes text,
  unique(user_id, habit_id, logged_on)
);

create table if not exists public.habit_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  reminder_email text,
  reminder_time time not null,
  timezone text not null default 'America/Los_Angeles',
  days_of_week integer[] not null default '{1,2,3,4,5,6,0}',
  is_active boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.check_in_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  frequency text not null default 'weekly' check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  questions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_check_in_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_template_id uuid not null references public.check_in_templates(id) on delete cascade,
  reminder_email text,
  reminder_day integer check (reminder_day between 0 and 6),
  reminder_time time,
  timezone text not null default 'America/Los_Angeles',
  is_active boolean not null default true,
  unique(user_id, check_in_template_id)
);

create table if not exists public.check_in_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_template_id uuid not null references public.check_in_templates(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  weight text,
  measurements jsonb not null default '{}'::jsonb,
  energy integer check (energy between 1 and 10),
  sleep integer check (sleep between 1 and 10),
  stress integer check (stress between 1 and 10),
  hunger integer check (hunger between 1 and 10),
  mood integer check (mood between 1 and 10),
  wins text,
  struggles text,
  questions text,
  training_notes text,
  nutrition_notes text,
  habit_score integer check (habit_score between 0 and 100),
  coach_notes text
);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_submission_id uuid references public.check_in_submissions(id) on delete cascade,
  photo_url text not null,
  angle text,
  created_at timestamptz not null default now()
);

create table if not exists public.check_in_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_template_id uuid not null references public.check_in_templates(id) on delete cascade,
  reminder_email text,
  due_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'skipped', 'failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  channel text not null check (channel in ('email', 'sms', 'in_app')),
  recipient text,
  subject text,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.workout_programs enable row level security;
alter table public.program_weeks enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_completions enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.classroom_lessons enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_reactions enable row level security;
alter table public.habits enable row level security;
alter table public.user_habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.habit_reminders enable row level security;
alter table public.check_in_templates enable row level security;
alter table public.user_check_in_settings enable row level security;
alter table public.check_in_submissions enable row level security;
alter table public.progress_photos enable row level security;
alter table public.check_in_reminders enable row level security;
alter table public.notification_logs enable row level security;

create policy "Members can read published programs" on public.workout_programs
  for select using (is_published = true);

create policy "Members can read published lessons" on public.classroom_lessons
  for select using (is_published = true);

create policy "Authenticated users can read communities" on public.communities
  for select to authenticated using (true);

create policy "Users can manage own completions" on public.workout_completions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own exercise logs" on public.exercise_logs
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own membership" on public.memberships
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "Authenticated users can create posts" on public.community_posts
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Authenticated users can read posts" on public.community_posts
  for select to authenticated using (true);

create policy "Authenticated users can create comments" on public.community_comments
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Authenticated users can read comments" on public.community_comments
  for select to authenticated using (true);

create policy "Members can read active habits" on public.habits
  for select to authenticated using (is_active = true);

create policy "Users can read own habit assignments" on public.user_habits
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can manage own habit logs" on public.habit_logs
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own habit reminders" on public.habit_reminders
  for select to authenticated using (auth.uid() = user_id);

create policy "Members can read active check-in templates" on public.check_in_templates
  for select to authenticated using (is_active = true);

create policy "Users can read own check-in settings" on public.user_check_in_settings
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can manage own check-in submissions" on public.check_in_submissions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own progress photos" on public.progress_photos
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own check-in reminders" on public.check_in_reminders
  for select to authenticated using (auth.uid() = user_id);
