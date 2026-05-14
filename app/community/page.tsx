import { AppShell } from "@/components/AppShell";
import { getCommunities } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const communities = await getCommunities();

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Community</p>
          <h1>Separate communities.</h1>
          <p className="lead">Create groups for Inner Fire, corporate cohorts, private clients, or topic-based support.</p>
        </div>
      </div>
      <section className="grid three">
        {communities.map((community) => (
          <article className="card" key={community.id}>
            <p className="eyebrow">{community.visibility}</p>
            <h3>{community.name}</h3>
            <p>{community.description}</p>
          </article>
        ))}
        {communities.length === 0 ? (
          <article className="card">
            <h3>No communities yet</h3>
            <p>Create separate communities for each program, cohort, or company.</p>
          </article>
        ) : null}
      </section>
    </AppShell>
  );
}
