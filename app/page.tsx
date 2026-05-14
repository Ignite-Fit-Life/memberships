import Link from "next/link";

export default function HomePage() {
  return (
    <main className="hero">
      <div>
        <p className="eyebrow">Ignite Fit Life members</p>
        <h1>Your workouts, classroom, and community in one place.</h1>
        <p className="lead">
          A private performance platform for members to follow programs, watch educational lessons,
          track progress, and connect inside dedicated communities.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/signup">
            Create Account
          </Link>
          <Link className="button secondary" href="/login">
            Member Login
          </Link>
        </div>
      </div>
    </main>
  );
}
