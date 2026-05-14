import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Workouts", "/workouts"],
  ["Habits", "/habits"],
  ["Check-ins", "/check-ins"],
  ["Classroom", "/classroom"],
  ["Community", "/community"],
  ["Admin", "/admin"]
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">IF</span>
          <span>Ignite Fit Life</span>
        </Link>
        <nav className="nav" aria-label="Member navigation">
          {nav.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
