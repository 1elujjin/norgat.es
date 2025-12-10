export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f7",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "24px 28px",
          borderRadius: "12px",
          boxShadow: "0 15px 40px rgba(15,23,42,0.12)",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <h1 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
          Discord Verification
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#4b5563", marginBottom: "1.5rem" }}>
          Click the button below to verify and get access to the server.
        </p>
        <a
          href="/api/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.7rem 1.2rem",
            borderRadius: "999px",
            background: "#111827",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.95rem"
          }}
        >
          Verify with Discord
        </a>
      </div>
    </main>
  );
}
