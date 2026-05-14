import { AppShell } from "@/components/AppShell";
import { getHabits } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await getHabits();

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Habits</p>
          <h1>Daily and weekly habit tracking.</h1>
          <p className="lead">
            Assign habits like protein, steps, water, sleep, mobility, stress resets, and meal prep.
          </p>
        </div>
      </div>
      <section className="grid three">
        {habits.map((habit) => (
          <article className="card" key={habit.id}>
            <p className="eyebrow">{habit.frequency}</p>
            <h3>{habit.title}</h3>
            <p>{habit.description}</p>
            <p>
              Target: {habit.target_value} {habit.target_unit}
            </p>
          </article>
        ))}
        {habits.length === 0 ? (
          <article className="card">
            <h3>No habits yet</h3>
            <p>Create habits in Supabase or the admin area, then assign them to clients.</p>
          </article>
        ) : null}
      </section>
    </AppShell>
  );
}
