create extension if not exists "pgcrypto";

alter table public.workout_programs add column if not exists updated_at timestamptz not null default now();
alter table public.program_weeks add column if not exists focus text;
alter table public.program_weeks add column if not exists sort_order integer not null default 0;
alter table public.workouts add column if not exists notes text;
alter table public.workouts add column if not exists sort_order integer not null default 0;
alter table public.workouts add column if not exists is_template boolean not null default false;
alter table public.workouts add column if not exists template_name text;

create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  muscle_group text,
  equipment text,
  difficulty text,
  demo_video_url text,
  thumbnail_url text,
  instructions text,
  coaching_cues text,
  common_mistakes text,
  regression text,
  progression text,
  substitutions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_blocks (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  type text not null default 'strength' check (type in ('strength', 'superset', 'circuit', 'amrap', 'emom', 'mobility', 'hiit', 'note')),
  title text not null,
  instructions text,
  rounds integer,
  work_seconds integer,
  rest_seconds integer,
  time_cap_minutes integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_block_id uuid not null references public.workout_blocks(id) on delete cascade,
  exercise_id uuid references public.exercise_library(id) on delete set null,
  title text not null,
  demo_video_url text,
  instructions text,
  coaching_cues text,
  substitutions text,
  sets integer,
  reps text,
  load text,
  rpe numeric(3,1),
  tempo text,
  rest_seconds integer,
  duration_seconds integer,
  side text check (side in ('left', 'right', 'both')),
  notes text,
  group_label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.program_assignments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.workout_programs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null default current_date,
  end_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  current_week integer not null default 1,
  current_day integer not null default 1,
  created_at timestamptz not null default now(),
  unique(program_id, user_id)
);

create unique index if not exists program_assignments_program_user_key
  on public.program_assignments(program_id, user_id);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  program_assignment_id uuid references public.program_assignments(id) on delete set null,
  completed_at timestamptz not null default now(),
  status text not null default 'completed' check (status in ('completed', 'skipped', 'partial')),
  notes text,
  score text,
  duration_minutes integer
);

create table if not exists public.set_logs (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  workout_exercise_id uuid references public.workout_exercises(id) on delete set null,
  set_number integer not null,
  target_reps text,
  actual_reps text,
  target_load text,
  actual_load text,
  rpe numeric(3,1),
  completed boolean not null default true,
  notes text
);

create table if not exists public.personal_bests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid references public.exercise_library(id) on delete cascade,
  type text not null,
  value text not null,
  achieved_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.exercise_library enable row level security;
alter table public.workout_blocks enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.program_assignments enable row level security;
alter table public.workout_logs enable row level security;
alter table public.set_logs enable row level security;
alter table public.personal_bests enable row level security;

drop policy if exists "Authenticated users can read exercise library" on public.exercise_library;
create policy "Authenticated users can read exercise library" on public.exercise_library
  for select to authenticated using (true);

drop policy if exists "Members can read workout blocks" on public.workout_blocks;
create policy "Members can read workout blocks" on public.workout_blocks
  for select to authenticated using (true);

drop policy if exists "Members can read workout exercises" on public.workout_exercises;
create policy "Members can read workout exercises" on public.workout_exercises
  for select to authenticated using (true);

drop policy if exists "Members can read program weeks" on public.program_weeks;
create policy "Members can read program weeks" on public.program_weeks
  for select to authenticated using (true);

drop policy if exists "Members can read workouts" on public.workouts;
create policy "Members can read workouts" on public.workouts
  for select to authenticated using (true);

drop policy if exists "Members can read legacy exercises" on public.exercises;
create policy "Members can read legacy exercises" on public.exercises
  for select to authenticated using (true);

drop policy if exists "Users can read own program assignments" on public.program_assignments;
create policy "Users can read own program assignments" on public.program_assignments
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can manage own workout logs" on public.workout_logs;
create policy "Users can manage own workout logs" on public.workout_logs
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own set logs" on public.set_logs;
create policy "Users can manage own set logs" on public.set_logs
  for all to authenticated using (
    exists (
      select 1 from public.workout_logs
      where workout_logs.id = set_logs.workout_log_id
      and workout_logs.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_logs
      where workout_logs.id = set_logs.workout_log_id
      and workout_logs.user_id = auth.uid()
    )
  );

drop policy if exists "Users can read own personal bests" on public.personal_bests;
create policy "Users can read own personal bests" on public.personal_bests
  for select to authenticated using (auth.uid() = user_id);
