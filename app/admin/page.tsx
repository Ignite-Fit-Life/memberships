import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

const adminAreas = [
  ["Workout Programs", "Create 90-day programs, weeks, workouts, exercises, demo videos, sets, reps, weight, RPE, tempo, and rest."],
  ["Habits", "Create habit targets and assign daily or weekly habits to clients."],
  ["Check-ins", "Create check-in templates, review submissions, and schedule automated reminders."],
  ["Classroom", "Create lessons for mobility, HIIT, nutrition, sleep, stress, energy, and performance."],
  ["Communities", "Create separate communities for cohorts, companies, and member groups."],
  ["Members", "Review member profiles, membership status, and access level."],
  ["Payments", "Monitor Stripe membership status and access changes."]
];

export default function AdminPage() {
  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Manage the member platform.</h1>
          <p className="lead">This is the control center for content, access, and communities.</p>
        </div>
      </div>
      <section className="grid two">
        {adminAreas.map(([title, body]) => (
          <article className="card" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
