import { AlertCircle } from 'lucide-react'

export default function ErrorDisplay({ message, onDismiss }) {
  if (!message) return null
  
  return (
    <div style={{
      backgroundColor: '#fef2f2',
      borderLeft: '4px solid #dc2626',
      color: '#991b1b',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: '#991b1b' }}>Oops, something went wrong</h4>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>{message}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
          If this persists, please contact the support team at <a href="mailto:it.medicfoundation@gmail.com" style={{ color: '#dc2626', textDecoration: 'underline' }}>it.medicfoundation@gmail.com</a>
        </p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '1.25rem', padding: '0 0.25rem'
        }}>×</button>
      )}
    </div>
  )
}
