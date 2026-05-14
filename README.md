# Ignite Fit Life Members

Private member platform for Ignite Fit Life.

## Features

- Member accounts with Supabase Auth
- Stripe membership checkout and webhook placeholders
- Member dashboard
- Workout programs, weeks, workouts, exercises, and completion tracking
- Exercise prescriptions with demo video, sets, reps, prescribed load, RPE, tempo, rest, coaching cues, and substitutions
- Exercise logs for actual weight, reps, RPE, and member notes
- Habit definitions, client habit assignments, and habit logs
- Check-in templates, client submissions, progress photos, and coach notes
- Automated check-in reminders through Vercel Cron and Resend email
- Automated habit reminders through Vercel Cron and Resend email
- Classroom lessons and educational videos
- Multiple communities with posts, comments, and reactions
- Admin screens for managing programs, classroom content, and communities

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add Supabase and Stripe keys.
3. Run the SQL in `supabase/schema.sql` inside your Supabase project.
4. Optionally run `supabase/seed.sql` to add starter programs, lessons, habits, check-ins, and communities.
5. Add a Resend API key if you want automated email reminders.
6. Install dependencies with `npm install`.
7. Start locally with `npm run dev`.

Deploy on Vercel after adding the same environment variables to the Vercel project.

## Reminder Automation

`vercel.json` schedules `/api/reminders/check-ins` every hour and `/api/reminders/habits`
every 15 minutes. The endpoints find due reminders, send emails through Resend, mark reminders
as sent, and write to `notification_logs`.

Set `CRON_SECRET` in Vercel and include the same value as an Authorization bearer token for
manual calls. Vercel Cron can call the route automatically in production.
