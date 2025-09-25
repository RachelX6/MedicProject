// pages/401.js
export default function UnauthorizedPage() {
  return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>401 • Unauthorized</h1>
      <p style={{ fontSize: "1.25rem" }}>
        You must be logged in to view this page.
      </p>
    </div>
  );
}
