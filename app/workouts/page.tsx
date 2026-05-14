import { AppShell } from "@/components/AppShell";
import { getPrograms } from "@/lib/data";

export default async function WorkoutsPage() {
  const programs = await getPrograms();

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Workouts</p>
          <h1>Training programs.</h1>
          <p className="lead">Members can follow programs, complete workouts, and track progress.</p>
        </div>
      </div>
      <section className="grid three">
        {programs.map((program) => (
          <article className="card" key={program.id}>
            <h3>{program.title}</h3>
            <p>{program.description}</p>
            <p>{program.duration_weeks} weeks · {program.level}</p>
          </article>
        ))}
        {programs.length === 0 ? (
          <article className="card">
            <h3>No programs yet</h3>
            <p>Create workout programs in Supabase or the admin area.</p>
          </article>
        ) : null}
      </section>
    </AppShell>
  );
}
