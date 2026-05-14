import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="hero">
      <div>
        <p className="eyebrow">Create account</p>
        <h1>Start your member account.</h1>
        <p className="lead">
          Create your login first. Membership checkout can be connected through Stripe once your
          program and pricing are final.
        </p>
        <form className="form" action="/auth/signup" method="post" style={{ marginTop: 28 }}>
          <label>
            Name
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="new-password" required />
          </label>
          <button className="button" type="submit">
            Create Account
          </button>
        </form>
        <p className="lead">
          Already have access? <Link href="/login">Log in</Link>.
        </p>
      </div>
    </main>
  );
}
