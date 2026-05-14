Ignite Fit Life Members Platform Implementation Spec
Goal
Build a private member platform for Ignite Fit Life where clients can create an account, log in, access assigned workout programs, track habits, complete check-ins, watch educational classroom content, and participate in separate communities.

The platform should support future paid membership access through Stripe and automated habit/check-in reminders through email.

Current Stack
Hosting: Vercel
Repository: GitHub Ignite-Fit-Life/memberships
Frontend/backend: Next.js App Router
Database/Auth: Supabase
Payments: Stripe
Email reminders: Resend, planned
Immediate Deployment Requirements
The app must deploy successfully on Vercel before adding more features.

Required fixes:

Upgrade Next.js away from vulnerable 15.1.6.

Use next: 16.2.6
Use matching eslint-config-next: 16.2.6
Fix auth route 405 errors.

app/auth/signup/route.ts must support both POST and fallback GET.
app/auth/login/route.ts must support both POST and fallback GET.
Redirects must use NextResponse.redirect(..., 303), not redirect() from next/navigation.
Fix signup/login forms.

app/signup/page.tsx form must include method="post".
app/login/page.tsx form must include method="post".
Prevent Stripe from blocking builds.

Stripe should not initialize at module load.
Use a getStripe() helper that only creates Stripe inside API route handlers.
Keep reminder routes deploy-safe for now.

app/api/reminders/check-ins/route.ts can temporarily return a simple JSON response.
app/api/reminders/habits/route.ts can temporarily return a simple JSON response.
Full reminder logic can be added after auth and deployment are stable.
Environment Variables
Required now:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
Required later for Stripe:

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_MEMBERSHIP_PRICE_ID=
Required later for reminders:

RESEND_API_KEY=
REMINDER_EMAIL_FROM=
CRON_SECRET=
Important:

Never expose SUPABASE_SERVICE_ROLE_KEY in browser/client code.
NEXT_PUBLIC_SITE_URL should be the live Vercel/member site URL, not http://localhost:3000.
Core User Roles
Member
Members should be able to:

Create an account
Log in and log out
View dashboard
View assigned workout programs
Open workout days and exercises
Watch exercise demo videos
Log actual weight, reps, RPE, and notes
View and complete habits
Complete check-ins
Watch classroom lessons
Join communities they have access to
Create posts/comments in communities
Admin / Coach
Admin should be able to:

Create/edit workout programs
Create weeks and workout days
Add exercises with prescription details
Assign programs to clients
Create habits
Assign habits to clients
Create check-in templates
View check-in submissions
Upload/view progress photos
Create classroom lessons
Create multiple communities
Manage community access
Eventually manage membership access/payment status
Workout Program Requirements
Workout programs should support:

Program title
Description
Level
Goal
Duration/weeks
Published/unpublished status
Weeks
Workout days
Exercises
Exercise prescription fields:

Exercise name
Demo video URL
Sets
Reps
Prescribed load/weight
RPE
Tempo
Rest time
Coaching cues
Substitutions
Sort order
Member exercise log fields:

Actual weight
Actual reps
Actual RPE
Notes
Completion status
Date completed
Habits Requirements
Habits should support:

Habit title
Description
Target value
Target unit
Frequency
Assigned client
Reminder time
Timezone
Days of week
Email reminder destination
Completion logging
Future automation:

Vercel Cron checks due reminders.
Resend sends email notifications.
App records notification logs.
Check-In Requirements
Check-ins should support:

Check-in template title
Description
Frequency
Custom questions
Assigned client
Due date
Reminder email
Submission answers
Progress photos
Coach notes
Future automation:

Vercel Cron checks due check-ins.
Resend sends reminder emails.
App marks reminders as sent.
Classroom Requirements
Classroom lessons should support:

Title
Description
Video URL
Category
Sort order
Published/unpublished status
Examples:

Mobility education
Nutrition basics
Stress management
Sleep and recovery
Training technique
Executive performance topics
Community Requirements
The system must support multiple separate communities.

Community features:

Community title
Description
Access control
Posts
Comments
Reactions
Examples:

Inner Fire members
Executive coaching clients
Corporate wellness cohort
Mobility challenge group
Database Requirements
Supabase tables should include:

profiles
memberships
workout_programs
program_weeks
workouts
exercises
workout_completions
exercise_logs
habits
user_habits
habit_logs
habit_reminders
check_in_templates
user_check_in_settings
check_in_submissions
progress_photos
check_in_reminders
classroom_lessons
communities
community_members
community_posts
community_comments
community_reactions
notification_logs
Row Level Security should be enabled on member-facing tables.

Members should only read/write their own data unless content is published or they belong to a community.

Admins/coaches should have broader management access.

Pages
Public:

/
/signup
/login
Protected member pages:

/dashboard
/workouts
/habits
/check-ins
/classroom
/community
Admin:

/admin
API routes:

/auth/signup
/auth/login
/auth/logout
/api/stripe/checkout
/api/stripe/webhook
/api/reminders/habits
/api/reminders/check-ins
Acceptance Criteria
Deployment:

Vercel production build succeeds.
No vulnerable Next.js block.
Signup page loads.
Login page loads.
Signup does not return HTTP 405.
Login does not return HTTP 405.
Successful auth redirects to /dashboard.
Member experience:

A member can create an account.
A member can log in.
Protected pages redirect anonymous users to /login.
Logged-in users can view dashboard.
Admin/content:

Admin page loads.
Workout, habit, check-in, classroom, and community data can be read from Supabase.
Future:

Stripe checkout creates/updates membership records.
Reminder routes send emails through Resend.
Cron jobs run safely without exposing secrets.
Implementation Priority
Stabilize deploy and auth.
Confirm Supabase schema and seed data.
Confirm member dashboard pages can read data.
Build admin creation/editing screens.
Add program assignment flow.
Add habit/check-in assignment flow.
Add community access controls.
Add Stripe checkout and webhook.
Add reminder email automation.
Add mobile polish and UX refinements.
