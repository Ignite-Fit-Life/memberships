import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="hero">
      <div>
        <p className="eyebrow">Member login</p>
        <h1>Welcome back.</h1>
        <p className="lead">Log in to access your workouts, classroom, and communities.</p>
        <form className="form" action="/auth/login" method="post" style={{ marginTop: 28 }}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="button" type="submit">
            Log In
          </button>
        </form>
        <p className="lead">
          New here? <Link href="/signup">Create an account</Link>.
        </p>
      </div>
    </main>
  );
}
