import { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import LoadingOverlay from '../components/LoadingOverlay'

export default function ViewMatch() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push('/profile')
      return
    }

    const fetchData = async () => {
      setLoading(true)

      const [{ data: roleData, error: roleError }, { data: matchData, error: matchError }] = await Promise.all([
        supabase.from('personal_profiles_view').select('user_role').eq('email', user.email).single(),
        supabase.functions.invoke('get_match_data', { method: 'GET' })
      ])

      if (roleError) {
        setError('Failed to get role info.')
        setLoading(false)
        return
      }
      setUserRole(roleData.user_role)

      if (matchError) {
        setError(matchError.message || 'Failed to load matches.')
      } else {
        setMatchData(matchData)
      }

      setLoading(false)
    }

    fetchData()
  }, [user, supabase, router])

  if (loading) return<LoadingOverlay message="Loading your matches… ⏳" />
  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>
  if (!matchData) return null

  const { permanent, temporary } = matchData

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '600px',
      margin: '2rem auto',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      color: '#333'
    }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#8d171b' }}>
        Your Schedule
      </h1>

      {/* Permanent Match */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '.5rem' }}>
          {userRole === 'senior' ? 'Assigned Volunteer' : 'Assigned Senior'}
        </h2>
        {permanent.status === 'positive' ? (
          <p>
            You’re paired with <strong>{permanent.preferred_name}</strong>!
          </p>
        ) : (
          <p>No permanent match available yet.</p>
        )}
      </section>

      {/* Temporary Matches */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '.5rem' }}>
          Temporary Bookings
        </h2>
        {temporary.status === 'positive' && temporary.matches.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {temporary.matches.map((m, idx) => {
              const dt = new Date(m.date)
              const formatted = dt.toLocaleString('en-CA', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'UTC'
              })
              return (
                <li key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  border: '1px solid #eee',
                  borderRadius: '5px',
                  marginBottom: '0.75rem'
                }}>
                  <span>Session with <strong>{m.preferred_name}</strong></span>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {formatted}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p>No temporary sessions scheduled.</p>
        )}
      </section>

      {/* Feedback Form (Seniors Only) */}
      {userRole === 'senior' && (
        <section style={{
          margin: '2rem 0',
          padding: '1rem',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Help Us Improve 💬
          </h2>
          <p style={{ marginBottom: '0.75rem' }}>
            After each session, we would love to hear your thoughts. Please fill out this quick form to help us improve the program for everyone.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdm45bdDhAjJsVTMULYM9f2stWC0JeDPCwGyWkx957wLJG1uw/viewform?usp=sharing&ouid=111449304528109314275"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.25rem',
              backgroundColor: '#8d171b',
              color: '#fff',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Give Feedback →
          </a>
        </section>
      )}

      {/* Back Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => router.push('/profile')}
          style={{
            backgroundColor: '#8d171b',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            textDecoration: 'none',
            fontFamily: 'inherit',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  )
}
