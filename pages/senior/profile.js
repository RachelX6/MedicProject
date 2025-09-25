import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useProfile from '../../hooks/useProfile'

export default function SeniorProfilePage() {
  const { profile, loading } = useProfile()
  const supabase = useSupabaseClient()
  const router = useRouter()

  // ✅ States for tracking completion
  const [completedPersonality, setCompletedPersonality] = useState(false)
  const [completedInterests, setCompletedInterests] = useState(false)

  useEffect(() => {
    if (!profile) return

    // 1) Check "senior_preferences" table for personality questionnaire
    supabase
      .from('senior_preferences')
      .select('id')
      .eq('id', profile.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setCompletedPersonality(true)
      })

    // 2) Check "interests" table for interests completion
    supabase
      .from('interests')
      .select('id')
      .eq('id', profile.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setCompletedInterests(true)
      })
  }, [profile, supabase])

  // Loading screen
  if (loading) {
    return <div>Loading profile...</div>
  }

  // No profile found
  if (!profile) {
    return <div>Could not find profile. You may need to log in.</div>
  }

  const hasTodos = !completedPersonality || !completedInterests

  const borderColor =
    profile.user_status === 'rejected' ? 'red' :
      profile.user_status === 'pending' ? 'goldenrod' :
        'transparent'

  const handleLogout = () => {
    supabase.auth.signOut().then(() => router.push('/'))
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: borderColor !== 'transparent' ? `2px solid ${borderColor}` : undefined,
    }}>
      {/* Header */}
      <section style={{ position: 'relative', borderBottom: '1px solid #ccc', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
        <h1 style={{ color: '#8d171b', fontSize: '2rem' }}>
          Hi {profile.preferred_name}!
        </h1>
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          {profile.user_status === 'pending' && <span style={{ color: 'goldenrod' }}>⏳ Pending</span>}
          {profile.user_status === 'rejected' && <span style={{ color: 'red' }}>❌ Rejected</span>}
          <button onClick={() => router.push('/editProfile')} style={{
            background: '#f5f5f5',
            color: 'black',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '0.4rem 0.75rem',
            cursor: 'pointer'
          }}>
            ✏️ Edit Profile
          </button>
        </div>
        <div style={{ marginTop: '1rem', lineHeight: '1.5', paddingBottom: '1rem', color: 'black' }}>
          <p><strong>Preferred Name:</strong> {profile.preferred_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone_number}</p>
          <p><strong>Gender:</strong> {profile.gender}</p>
          <p><strong>Birthday:</strong> {profile.birthday}</p>
          <p><strong>Primary Language:</strong> {profile.primary_language}</p>
          <p><strong>Secondary Languages:</strong> {(profile.secondary_language || []).join(', ')}</p>
          <p><strong>Senior Home:</strong> {profile.senior_home}</p>
        </div>
      </section>

      {/* Guide */}
      <section style={{ borderBottom: '1px solid #ccc', marginBottom: '1.5rem', paddingBottom: '1rem', color: 'black' }}>
        <h2 style={{ color: '#8d171b' }}>📝 Guide</h2>
        <ul style={{ paddingLeft: '1rem' }}>
          <li>😊 You’ll be matched with a <strong>volunteer</strong></li>
          <li>📖 View your <strong>upcoming sessions</strong></li>
        </ul>
      </section>

      {/* To-Do List */}
      {hasTodos && (
        <section style={{ borderBottom: '1px solid #ccc', marginBottom: '1.5rem', paddingBottom: '1rem', color: 'black' }}>
          <h2 style={{ color: '#8d171b' }}>📋 To-Do List</h2>
          <ul style={{ paddingLeft: '1rem' }}>
            {!completedPersonality && <li>✅ Complete Preferences Questionnaire</li>}
            {!completedInterests && <li>✅ Fill out Interests Questionnaire</li>}
          </ul>
        </section>
      )}

      {/* Navigation */}
      <section style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#8d171b' }}>📂 Navigation</h2>
        <StyledButton onClick={() => router.push('/questionnaire')}>
          🌱 Personality Questionnaire
        </StyledButton>
        <StyledButton onClick={() => router.push('/interestsQuestionnaire')}>
          🎯 Interests Questionnaire
        </StyledButton>
        <StyledButton onClick={() => router.push('/senior/changeAvailability')}>
          📆 Change Availability
        </StyledButton>
        <StyledButton onClick={() => router.push('/viewMatch')}>
          📖 My Sessions
        </StyledButton>
      </section>

      {/* Logout */}
      <section style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={handleLogout} style={{
          backgroundColor: '#8d171b',
          color: '#fff',
          padding: '0.75rem 2rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Log Out
        </button>
      </section>
    </div>
  )
}

function StyledButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid #ccc',
        padding: '0.75rem 1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        textAlign: 'left',
        color: 'black',
        transition: 'background 0.2s ease',
      }}
      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#eee')}
      onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
    >
      {children}
    </button>
  )
}
