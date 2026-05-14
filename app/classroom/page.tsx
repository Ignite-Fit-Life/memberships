import { AppShell } from "@/components/AppShell";
import { getLessons } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ClassroomPage() {
  const lessons = await getLessons();

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Classroom</p>
          <h1>Educational videos.</h1>
          <p className="lead">Teach members about nutrition, mobility, stress, sleep, energy, and performance.</p>
        </div>
      </div>
      <section className="grid three">
        {lessons.map((lesson) => (
          <article className="card" key={lesson.id}>
            <p className="eyebrow">{lesson.category}</p>
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
          </article>
        ))}
        {lessons.length === 0 ? (
          <article className="card">
            <h3>No lessons yet</h3>
            <p>Add educational videos by category in Supabase or the admin area.</p>
          </article>
        ) : null}
      </section>
    </AppShell>
  );
}
