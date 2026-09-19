import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Composer from "./composer";

export default function Dashboard() {
  const session = getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Dashboard</h1>
        <a href="/api/auth/logout" style={{ fontSize: 14, color: "#555" }}>
          Log out
        </a>
      </div>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16 }}>Connected Pages</h2>
        {session!.pages.length === 0 ? (
          <p style={{ color: "#b00020" }}>
            No Pages found on this account. Make sure your Facebook user is
            an admin of at least one Page, and that Page is visible to this
            app (tester role).
          </p>
        ) : (
          <ul>
            {session!.pages.map((p) => (
              <li key={p.id}>
                {p.name} <span style={{ color: "#888" }}>({p.id})</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16 }}>Compose post</h2>
        <Composer pages={session!.pages.map((p) => ({ id: p.id, name: p.name }))} />
      </section>
    </main>
  );
}
