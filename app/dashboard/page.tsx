import { AppShell } from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Today&apos;s next step.</h1>
          <p className="lead">Pick up your program, continue a lesson, or check in with your community.</p>
        </div>
      </div>
      <section className="grid three">
        <article className="card">
          <h3>Current workout</h3>
          <p>Show the member&apos;s next workout with demos, sets, reps, load, RPE, tempo, rest, and notes.</p>
        </article>
        <article className="card">
          <h3>Habits and check-ins</h3>
          <p>Track daily habits and remind members when weekly check-ins are due.</p>
        </article>
        <article className="card">
          <h3>Community</h3>
          <p>See new posts from the member&apos;s assigned groups.</p>
        </article>
      </section>
    </AppShell>
  );
}
