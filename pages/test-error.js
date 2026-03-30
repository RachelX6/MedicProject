import ErrorDisplay from '../components/ErrorDisplay'

export default function TestError() {
  return (
    <div style={{
      maxWidth: "750px",
      margin: "4rem auto",
      padding: "2.5rem",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h1 style={{ color: "#8d171b", marginBottom: "1.5rem", fontSize: "2rem" }}>
        Example Page
      </h1>
      
      <p style={{ color: "#666", marginBottom: "2rem", lineHeight: "1.5" }}>
        This is what a page looks like before an error occurs...
      </p>

      <ErrorDisplay 
        message={"Failed to connect to the database. Connection timeout after 5000ms."} 
        onDismiss={() => { alert("Dismiss clicked!") }} 
      />

      <div style={{ padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
        <p style={{ margin: 0, color: "#171717" }}>Form or content would continue here...</p>
      </div>
    </div>
  )
}
