import { AppShell } from "@/components/AppShell";
import { getCheckInTemplates } from "@/lib/data";

export default async function CheckInsPage() {
  const templates = await getCheckInTemplates();

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Check-ins</p>
          <h1>Client check-ins and coach review.</h1>
          <p className="lead">
            Collect weight, measurements, progress photos, energy, sleep, stress, wins, struggles, and questions.
          </p>
        </div>
      </div>
      <section className="grid two">
        {templates.map((template) => (
          <article className="card" key={template.id}>
            <p className="eyebrow">{template.frequency}</p>
            <h3>{template.title}</h3>
            <p>{template.description}</p>
          </article>
        ))}
        {templates.length === 0 ? (
          <article className="card">
            <h3>No check-ins yet</h3>
            <p>Create check-in templates, assign them to clients, and schedule reminder times.</p>
          </article>
        ) : null}
      </section>
    </AppShell>
  );
}
