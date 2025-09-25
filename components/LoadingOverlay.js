export default function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.35)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      {/* Spinner */}
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #ddd',
        borderTop: '5px solid #8d171b',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
      }} />

      <p style={{ color: '#8d171b', fontSize: '1.25rem', fontWeight: '500' }}>
        {message}
      </p>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
