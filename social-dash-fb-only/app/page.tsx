export default function Home({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main
      style={{
        maxWidth: 480,
        margin: "80px auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1>Social Dash</h1>
      <p style={{ color: "#555" }}>
        Connect your Facebook Page to compose and publish posts.
      </p>

      {searchParams.error && (
        <p style={{ color: "#b00020", fontSize: 14 }}>
          Error: {decodeURIComponent(searchParams.error)}
        </p>
      )}

      <a
        href="/api/auth/meta"
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "12px 24px",
          background: "#1877F2",
          color: "white",
          borderRadius: 6,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Connect Facebook
      </a>
    </main>
  );
}
